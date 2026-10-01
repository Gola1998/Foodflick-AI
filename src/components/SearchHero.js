import { useState } from "react";
import PhotoSearch from "./PhotoSearch";
import ModelProgress from "./ModelProgress";
import useModelStatus from "../utils/useModelStatus";
import useVoiceSearch from "../utils/useVoiceSearch";
import { MOODS } from "../utils/moods";

const tabStyle = (active) =>
  "px-4 py-1.5 rounded-full text-sm font-semibold transition " +
  (active ? "bg-orange-500 text-white" : "text-gray-600 hover:text-orange-600");

// The top of the home page. ONE input does everything:
//   By name    -> normal filter (onNameSearch)
//   By feeling -> AI Smart search (ai.run)
// 🎤 (voice) and 📷 (photo) are small buttons inside the bar, the mood chips are below it.
const SearchHero = ({ searchText, setSearchText, onNameSearch, restaurants, ai, onResults }) => {
  const [mode, setMode] = useState("name"); // "name" or "feeling"
  const [notice, setNotice] = useState("");
  const embedder = useModelStatus("embedder");
  const clip = useModelStatus("clip");

  const find = (text) =>
    mode === "name" ? onNameSearch(text) : ai.run(text, '"' + text + '"', null);

  // AI: the spoken words go into the input and run in the selected mode
  const voice = useVoiceSearch((spoken) => {
    setSearchText(spoken);
    find(spoken);
  });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-100 via-orange-50 to-white border border-orange-100 p-6 md:p-10 mb-10">
      {/* Decoration (big screens only) */}
      <span className="hidden lg:block absolute right-12 top-6 text-8xl rotate-12 select-none">🍕</span>
      <span className="hidden lg:block absolute right-48 bottom-6 text-6xl -rotate-12 select-none">🥗</span>
      <span className="hidden lg:block absolute right-10 bottom-8 text-5xl select-none">🍩</span>

      <div className="relative md:max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 leading-tight">
          What are you <span className="text-orange-500">craving</span> today?
        </h1>
        <p className="text-gray-600 mt-2">Type a dish, describe a feeling, say it out loud, or show us a photo.</p>

        {/* Mode switch */}
        <div className="inline-flex bg-white rounded-full p-1 shadow-sm mt-5">
          <button className={tabStyle(mode === "name")} onClick={() => setMode("name")}>
            🍽️ By name
          </button>
          <button className={tabStyle(mode === "feeling")} onClick={() => setMode("feeling")}>
            🧠 By feeling
          </button>
        </div>

        {/* The one input */}
        <div className="flex items-center gap-2 bg-white rounded-2xl shadow-md p-2 mt-3">
          <input
            type="text"
            placeholder={mode === "name" ? "Try pasta" : "Describe it..."}
            className="flex-1 min-w-0 px-3 py-2 text-base bg-transparent focus:outline-none"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && find(searchText)}
          />

          {/* Voice: hidden if the browser has no speech recognition */}
          {voice.supported && (
            <button
              title="Speak"
              className="w-10 h-10 shrink-0 rounded-full bg-orange-50 hover:bg-orange-100 text-lg transition"
              onClick={voice.start}
            >
              {voice.listening ? "🔴" : "🎤"}
            </button>
          )}

          <PhotoSearch restaurants={restaurants} onResults={onResults} onNotice={setNotice} />

          <button
            className="shrink-0 bg-orange-500 text-white font-semibold px-4 sm:px-6 py-2.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-50"
            disabled={ai.loading}
            onClick={() => find(searchText)}
          >
            {ai.loading ? (
              "..."
            ) : (
              <>
                <span className="hidden sm:inline">Find</span>
                <span className="sm:hidden">🔍</span>
              </>
            )}
          </button>
        </div>

        {/* Short messages under the bar */}
        {voice.listening && <p className="text-sm text-red-500 mt-2">🔴 Listening... say a dish name</p>}
        {notice && <p className="text-sm text-gray-600 mt-2">{notice}</p>}
        {ai.loading && embedder.state !== "loading" && (
          <p className="text-sm text-gray-600 mt-2">Comparing dishes... the first time can take a few seconds.</p>
        )}
        <ModelProgress model={embedder} what="search" size="about 25 MB" />
        <ModelProgress model={clip} what="photo" size="about 90 MB" />

        {/* Mood chips: each one is a sentence that describes the mood */}
        <p className="text-sm font-semibold text-gray-700 mt-6 mb-2">Or pick a mood</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar md:flex-wrap">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              disabled={ai.loading}
              onClick={() => ai.run(mood.query, mood.label, mood.id)}
              className={
                "shrink-0 px-3 py-1.5 rounded-full text-sm border whitespace-nowrap transition disabled:opacity-50 " +
                (ai.activeMood === mood.id
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-700 border-gray-200 hover:border-orange-400")
              }
            >
              {mood.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchHero;
