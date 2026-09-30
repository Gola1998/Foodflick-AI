import { buildMealText } from "../mealText";

test("builds one sentence from name, category, cuisine and ingredients", () => {
  const meal = {
    strMeal: "Chicken Handi",
    strCategory: "Chicken",
    strArea: "Indian",
    strIngredient1: "Chicken",
    strIngredient2: "Onion",
  };
  expect(buildMealText(meal)).toBe(
    "Chicken Handi. Chicken dish, Indian cuisine. Ingredients: chicken, onion"
  );
});

test("still works when category and area are missing", () => {
  const text = buildMealText({ strMeal: "Mystery", strIngredient1: "Rice" });
  expect(text).toBe("Mystery. Main dish, international cuisine. Ingredients: rice");
});
