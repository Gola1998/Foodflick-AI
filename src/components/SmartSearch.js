import { useState, useRef, useEffect } from "react";
import { getMealById } from "../utils/mealCache";
import { smartSearch } from "../utils/semanticSearch";
import { MOODS } from "../utils/moods";
import useModelStatus from "../utils/useModelStatus";
import ModelProgress from "./ModelProgress";

// FEATURES: Smart semantic search + mood-based ordering.
// This box only searches inside the dishes of the cuisine that is selected.
// It does NOT change the normal search box; it sends its result up to Body
// through onResults({ label, usedAI, items }), or onResults(null) to clear.
const SmartSearch = ({ restaurants, onResults }) => {
  const [query, setQuery] = useState("");
  const [activeMood, setActiveMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const runId = useRef(0); // numbers every search, so an old slow search cannot overwrite a newer one
  const model = useModelStatus("embedder");

  // if this box disappears (cuisine changed / reset), cancel any search still running
  useEffect(() => () => { runId.current++; }, []);

  // text = what we send to the AI, label = what we show the user
  const run = async (text, label, moodId) => {
    if (!text.trim() || restaurants.length === 0) return;

    const myRun = ++runId.current;
    setLoading(true);
    setActiveMood(moodId);

    // the AI needs the ingredients, so we download the full details of each dish
    // (mealCache remembers them, so this is slow only the first time)
    const meals = (
      await Promise.all(restaurants.map((r) => getMealById(r.id).catch(() => null)))
    ).filter(Boolean);

    const { results, usedAI } = await smartSearch(text, meals);
    if (myRun !== runId.current) return; // a newer search started, ignore this one

    const byId = Object.fromEntries(restaurants.map((r) => [r.id, r]));
    onResults({
      label,
      usedAI,
      items: results.map((r) => ({ restaurant: byId[r.id], score: r.score })),
    });
    setLoading(false);
  };

  const clear = () => {
    runId.current++; // cancels any search that is still running
    setQuery("");
    setActiveMood(null);
    setLoading(false);
    onResults(null);
  };

  return (
    <div className="mb-8 p-4 rounded-lg bg-orange-50 border border-orange-200 text-center">
      <p className="font-semibold text-gray-800">
        🧠 Smart search <span className="font-normal text-sm text-gray-500">- describe what you feel like</span>
      </p>

      <div className="flex flex-wrap justify-center gap-3 mt-3">
        <input
          type="text"
          placeholder='Try "something spicy and light"'
          className="w-80 px-5 py-3 border border-gray-300 rounded-md text-base focus:ring-2 focus:ring-orange-400 focus:outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run(query, '"' + query + '"', null)}
        />
        <button
          className="bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition disabled:opacity-50"
          onClick={() => run(query, '"' + query + '"', null)}
          disabled={loading || !query.trim()}
        >
          {loading && !activeMood ? "Thinking..." : "Smart search"}
        </button>
      </div>

      {/* Mood chips: each one is a sentence that describes the mood */}
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            disabled={loading}
            onClick={() => run(mood.query, mood.label, mood.id)}
            className={
              "px-3 py-1 rounded-full text-sm border transition disabled:opacity-50 " +
              (activeMood === mood.id
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-700 border-gray-300 hover:border-orange-400")
            }
          >
            {mood.label}
          </button>
        ))}
      </div>

      <ModelProgress model={model} what="search" size="about 25 MB" />
      {loading && model.state !== "loading" && (
        <p className="mt-3 text-xs text-gray-500">Comparing dishes... the first search can take a few seconds.</p>
      )}
    </div>
  );
};

export default SmartSearch;
