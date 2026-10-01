// FEATURE: "Similar dishes" (content-based recommendation)
// Idea: two dishes are similar if they share many ingredients.
// We measure it with the Jaccard similarity:
//
//     shared ingredients / all different ingredients of both dishes
//
// Example: A = {chicken, rice, onion}  B = {chicken, rice, peas}
//          shared = 2 (chicken, rice), all = 4  ->  score = 2/4 = 0.5

import { getIngredients } from "./getIngredients";

// Everyone uses these, so they say nothing about a dish. We ignore them.
const COMMON_INGREDIENTS = [
  "salt", "pepper", "black pepper", "water", "oil", "olive oil",
  "vegetable oil", "sunflower oil", "sugar",
];

export const getKeyIngredients = (meal) =>
  getIngredients(meal).filter((name) => !COMMON_INGREDIENTS.includes(name));

// Compare two meals. Returns the score and the list of shared ingredients.
export const similarityScore = (mealA, mealB) => {
  const a = new Set(getKeyIngredients(mealA)); // Set removes duplicates
  const b = new Set(getKeyIngredients(mealB));

  const shared = [...a].filter((name) => b.has(name));
  const all = new Set([...a, ...b]);

  const score = all.size === 0 ? 0 : shared.length / all.size;
  return { score, shared };
};

// Compare one meal with many candidates and return the best matches
export const rankSimilar = (mainMeal, candidates, topN = 4) => {
  return candidates
    .filter((meal) => meal.idMeal !== mainMeal.idMeal) // not the same dish
    .map((meal) => ({ meal, ...similarityScore(mainMeal, meal) }))
    .sort((x, y) => y.score - x.score) // highest score first
    .slice(0, topN);
};
