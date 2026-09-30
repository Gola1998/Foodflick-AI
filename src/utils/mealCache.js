// All the API calls for Phase 1 live here.
// We remember (cache) every dish we already downloaded,
// so the same dish is never fetched twice. This makes the app faster.

import { FOOD_API } from "./constants";

const mealCache = {}; // { "52772": {...full meal...} }

// Full details of ONE dish (ingredients, category, instructions...)
export const getMealById = async (id) => {
  if (mealCache[id]) return mealCache[id];

  const res = await fetch(FOOD_API + "/lookup.php?i=" + id);
  const json = await res.json();
  const meal = json.meals ? json.meals[0] : null;

  mealCache[id] = meal;
  return meal;
};

// List of dishes in a category, e.g. "Dessert".
// This list only has id, name and photo (no ingredients).
export const getMealsByCategory = async (category) => {
  const res = await fetch(FOOD_API + "/filter.php?c=" + category);
  const json = await res.json();
  return json.meals || []; // json.meals is null when nothing is found
};
