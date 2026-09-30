import { analyzeMeal } from "../allergens";

// helper: build a fake meal like TheMealDB gives us
const makeMeal = (category, ingredients) => {
  const meal = { strCategory: category };
  ingredients.forEach((name, i) => {
    meal["strIngredient" + (i + 1)] = name;
  });
  return meal;
};

test("chicken dish is Non-Veg and flour means gluten", () => {
  const result = analyzeMeal(makeMeal("Chicken", ["Chicken Breast", "Plain Flour"]));
  expect(result.isVeg).toBe(false);
  expect(result.allergens).toContain("gluten");
});

test("vegetarian dish with cheese is Veg and has dairy", () => {
  const result = analyzeMeal(makeMeal("Vegetarian", ["Tomato", "Mozzarella"]));
  expect(result.isVeg).toBe(true);
  expect(result.allergens).toEqual(["dairy"]);
});

test("coconut milk is NOT dairy", () => {
  const result = analyzeMeal(makeMeal("Vegan", ["Coconut Milk", "Rice"]));
  expect(result.allergens).not.toContain("dairy");
});

test("peanut butter is nuts but NOT dairy", () => {
  const result = analyzeMeal(makeMeal("Dessert", ["Peanut Butter"]));
  expect(result.allergens).toContain("nuts");
  expect(result.allergens).not.toContain("dairy");
});

test("eggplant is not egg, and graham does not contain ham", () => {
  const result = analyzeMeal(makeMeal("Vegetarian", ["Eggplant", "Graham Cracker"]));
  expect(result.allergens).not.toContain("egg");
  expect(result.isVeg).toBe(true);
});

test("fish sauce makes a dish Non-Veg and seafood", () => {
  const result = analyzeMeal(makeMeal("Miscellaneous", ["Rice", "Fish Sauce"]));
  expect(result.isVeg).toBe(false);
  expect(result.allergens).toContain("seafood");
});
