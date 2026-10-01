// FEATURE: "For You" personalization.
// We count what the user looks at (1 point) and adds to the cart (3 points):
//   { category: { Chicken: 4 }, area: { Indian: 4 }, ingredient: { rice: 3 }, seen: ["52772"] }
// The counts are saved in localStorage, so they stay after a refresh.
// There is no server and no account: the taste stays on this device only.

import { getKeyIngredients } from "./recommend";

const KEY = "foodflick-taste";

const emptyTaste = () => ({ category: {}, area: {}, ingredient: {}, seen: [] });

export const loadTaste = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || emptyTaste();
  } catch (error) {
    return emptyTaste();
  }
};

const addPoints = (counts, name, points) => {
  if (name) counts[name] = (counts[name] || 0) + points;
};

// meal = a full meal from the API
export const recordActivity = (meal, points) => {
  const taste = loadTaste();

  addPoints(taste.category, meal.strCategory, points);
  addPoints(taste.area, meal.strArea, points);
  getKeyIngredients(meal).forEach((name) => addPoints(taste.ingredient, name, points));
  if (!taste.seen.includes(meal.idMeal)) taste.seen.push(meal.idMeal);

  try {
    localStorage.setItem(KEY, JSON.stringify(taste));
  } catch (error) {
    console.log("Could not save taste:", error);
  }
};

export const clearTaste = () => {
  try {
    localStorage.removeItem(KEY);
  } catch (error) {
    console.log(error);
  }
};

// { Chicken: 4, Beef: 1 }  ->  ["Chicken", "Beef"]  (most points first)
export const getTopKeys = (counts, n) =>
  Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, n);

// How much will this user like this dish?
//   category counts double, cuisine counts once,
//   plus the average points of its ingredients (do we often eat these?)
export const scoreMeal = (meal, taste) => {
  const ingredients = getKeyIngredients(meal);
  const ingredientPoints = ingredients.reduce((sum, name) => sum + (taste.ingredient[name] || 0), 0);
  const average = ingredients.length === 0 ? 0 : ingredientPoints / ingredients.length;

  return (taste.category[meal.strCategory] || 0) * 2 + (taste.area[meal.strArea] || 0) + average;
};

// Best dishes for this user first. Dishes already seen are skipped.
export const rankByTaste = (meals, taste, topN = 4) =>
  meals
    .filter((meal) => !taste.seen.includes(meal.idMeal))
    .map((meal) => ({ meal, score: scoreMeal(meal, taste) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, topN)
    .map((item) => item.meal);
