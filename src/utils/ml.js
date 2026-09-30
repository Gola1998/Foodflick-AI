// THE AI ENGINE: loads small AI models that run INSIDE the user's browser.
// No server, no API key, no cost. Models download once and the browser caches them.
//
// WHY THE CDN? Transformers.js is loaded from a CDN link at runtime instead of
// "npm install". Parcel (our bundler) cannot bundle its ONNX engine - we tested it:
// the build fails inside onnxruntime-web. Loading from the CDN avoids the problem,
// keeps our bundle small, and needs no new dependency.
//
// Interview line: "I lazy-load the ML runtime, so users who never use AI
// features never download it."

const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0";

// The two models we use. "q8" = quantized, a smaller file with almost the same quality.
const MODELS = {
  embedder: {
    task: "feature-extraction",
    name: "Xenova/all-MiniLM-L6-v2", // text -> 384 numbers (about 23 MB)
  },
  sentiment: {
    task: "sentiment-analysis",
    name: "Xenova/distilbert-base-uncased-finetuned-sst-2-english", // about 65 MB
  },
};

// ---------- 1. Status (so the screen can show "Downloading... 40%") ----------

// state is: "idle" | "loading" | "ready" | "error"
let status = {
  embedder: { state: "idle", percent: 0 },
  sentiment: { state: "idle", percent: 0 },
};
const listeners = new Set();

const setStatus = (key, value) => {
  status = { ...status, [key]: value }; // new object, so React notices the change
  listeners.forEach((listener) => listener());
};

// These two functions are used by useModelStatus.js
export const subscribeToStatus = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getStatus = (key) => status[key];

// ---------- 2. Load the library (only once, only when first needed) ----------

let libraryPromise = null;

const loadLibrary = () => {
  if (!libraryPromise) {
    // The link sits in a variable on purpose: Parcel only rewrites import("text"),
    // so it leaves this one alone and the browser loads it natively.
    libraryPromise = import(TRANSFORMERS_URL).catch((error) => {
      libraryPromise = null; // allow a retry next time
      throw error;
    });
  }
  return libraryPromise;
};

// ---------- 3. Load a model (only once, then reused by every feature) ----------

const pipelines = {}; // remembers each model promise so we never load one twice

export const getPipeline = (key) => {
  if (pipelines[key]) return pipelines[key];

  const { task, name } = MODELS[key];
  setStatus(key, { state: "loading", percent: 0 });

  pipelines[key] = (async () => {
    const { pipeline, env } = await loadLibrary();

    // Without this, the library first looks for the model on OUR server (/models/...).
    // Parcel's dev server answers with index.html for unknown URLs, which breaks parsing.
    env.allowLocalModels = false;

    const files = {}; // { fileName: { loaded, total } } - a model is several files

    const model = await pipeline(task, name, {
      dtype: "q8",
      device: "wasm", // runs on the CPU in every browser; small models are fast enough
      progress_callback: (event) => {
        if (event.status !== "progress" || !event.total) return;
        files[event.file] = { loaded: event.loaded, total: event.total };

        const all = Object.values(files);
        const loaded = all.reduce((sum, f) => sum + f.loaded, 0);
        const total = all.reduce((sum, f) => sum + f.total, 0);
        setStatus(key, { state: "loading", percent: Math.min(99, Math.round((loaded / total) * 100)) });
      },
    });

    setStatus(key, { state: "ready", percent: 100 });
    return model;
  })().catch((error) => {
    pipelines[key] = null; // allow a retry next time
    setStatus(key, { state: "error", percent: 0 });
    throw error;
  });

  return pipelines[key];
};

// ---------- 4. Embeddings: text -> numbers ----------

// Give it ["spicy curry", "chocolate cake"], get back two lists of 384 numbers.
export const embedTexts = async (texts) => {
  const embedder = await getPipeline("embedder");
  const vectors = [];

  // Work in small batches so the browser tab does not freeze on big lists
  for (let i = 0; i < texts.length; i += 16) {
    const batch = texts.slice(i, i + 16);
    // pooling "mean" = average the word numbers into ONE list per sentence
    // normalize = scale each list to length 1, so cosine similarity is just a dot product
    const output = await embedder(batch, { pooling: "mean", normalize: true });
    vectors.push(...output.tolist());
  }
  return vectors;
};
