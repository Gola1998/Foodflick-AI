import { useState, useRef, useEffect } from "react";
import { getMealById } from "./mealCache";
import { smartSearch } from "./semanticSearch";

// FEATURES: Smart semantic search + mood-based ordering (the logic part).
// The screen (SearchHero.js) only shows the input and the mood chips.
// This hook searches inside the dishes of the selected cuisine and sends the result up
// through onResults({ label, usedAI, items }).
const useSmartSearch = (restaurants, onResults) => {
  const [activeMood, setActiveMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const runId = useRef(0); // numbers every search, so an old slow search cannot overwrite a newer one

  // if the screen disappears, cancel any search still running
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

  // cancels a running search and forgets the selected mood
  const reset = () => {
    runId.current++;
    setActiveMood(null);
    setLoading(false);
  };

  return { run, reset, loading, activeMood };
};

export default useSmartSearch;
