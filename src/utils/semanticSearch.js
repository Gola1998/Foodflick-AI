// FEATURE: Smart semantic search (embeddings + vector search)
//
// How it works:
//   1. Describe every dish in one sentence (mealText.js)
//   2. Turn every sentence into numbers with the AI model (ml.js)   <- done once per dish
//   3. Turn the user's query into numbers too
//   4. Rank the dishes by cosine similarity to the query (vectorMath.js)
//
// That is why "something spicy and light" can find a dish that does not contain
// the word "spicy": the MEANING is close, not the letters.

import { embedTexts } from "./ml";
import { buildMealText } from "./mealText";
import { rankBySimilarity } from "./vectorMath";
import { keywordRank } from "./keywordSearch";

const vectorCache = new Map(); // dish id -> its numbers, so we embed each dish only once

// meals: full meals from the API. Returns { results: [{ id, score }], usedAI }
export const smartSearch = async (query, meals, topN = 8) => {
  try {
    // embed only the dishes we have not seen yet
    const missing = meals.filter((meal) => !vectorCache.has(meal.idMeal));
    if (missing.length > 0) {
      const vectors = await embedTexts(missing.map(buildMealText));
      missing.forEach((meal, i) => vectorCache.set(meal.idMeal, vectors[i]));
    }

    const [queryVector] = await embedTexts([query]);
    const items = meals.map((meal) => ({ id: meal.idMeal, vector: vectorCache.get(meal.idMeal) }));

    return { results: rankBySimilarity(queryVector, items, topN), usedAI: true };
  } catch (error) {
    // The model could not load (offline, blocked...). The app must still work.
    console.log("AI model unavailable, using keyword search instead:", error);
    const docs = meals.map((meal) => ({ id: meal.idMeal, text: buildMealText(meal) }));
    return { results: keywordRank(query, docs, topN), usedAI: false };
  }
};
