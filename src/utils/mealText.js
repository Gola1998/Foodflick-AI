// The AI cannot "read" a dish card. It needs a sentence that describes the dish.
// TheMealDB has no description, so we build one from the fields it does have.
// Better text in = better matches out.
//
// Example result:
//   "Chicken Handi. Chicken dish, Indian cuisine. Ingredients: chicken, onion, tomato, chilli"

import { getIngredients } from "./getIngredients";

export const buildMealText = (meal) => {
  const ingredients = getIngredients(meal).slice(0, 12); // the first ones matter most
  return (
    meal.strMeal +
    ". " +
    (meal.strCategory || "Main") +
    " dish, " +
    (meal.strArea || "international") +
    " cuisine. Ingredients: " +
    ingredients.join(", ")
  );
};
