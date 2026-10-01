import { loadTaste, recordActivity, clearTaste, getTopKeys, scoreMeal, rankByTaste } from "../tasteProfile";

const makeMeal = (id, category, area, ingredients) => {
  const meal = { idMeal: id, strCategory: category, strArea: area };
  ingredients.forEach((name, i) => {
    meal["strIngredient" + (i + 1)] = name;
  });
  return meal;
};

beforeEach(() => localStorage.clear());

test("starts empty", () => {
  expect(loadTaste()).toEqual({ category: {}, area: {}, ingredient: {}, seen: [] });
});

test("a view gives 1 point, a cart add gives 3, and it is saved", () => {
  const meal = makeMeal("1", "Chicken", "Indian", ["Chicken", "Rice", "Salt"]);
  recordActivity(meal, 1);
  recordActivity(meal, 3);

  const taste = loadTaste(); // read again from localStorage
  expect(taste.category.Chicken).toBe(4);
  expect(taste.area.Indian).toBe(4);
  expect(taste.ingredient.rice).toBe(4);
  expect(taste.ingredient.salt).toBeUndefined(); // salt says nothing about taste
  expect(taste.seen).toEqual(["1"]); // not added twice
});

test("clearTaste forgets everything", () => {
  recordActivity(makeMeal("1", "Beef", "British", ["Beef"]), 1);
  clearTaste();
  expect(loadTaste().category).toEqual({});
});

test("getTopKeys returns the most points first", () => {
  expect(getTopKeys({ Beef: 1, Chicken: 4, Pasta: 2 }, 2)).toEqual(["Chicken", "Pasta"]);
});

test("dishes the user likes score higher and seen dishes are skipped", () => {
  const liked = makeMeal("1", "Chicken", "Indian", ["Chicken", "Rice"]);
  recordActivity(liked, 3);
  const taste = loadTaste();

  const similar = makeMeal("2", "Chicken", "Indian", ["Chicken", "Peas"]);
  const different = makeMeal("3", "Dessert", "French", ["Sugar cane", "Cream"]);

  expect(scoreMeal(similar, taste)).toBeGreaterThan(scoreMeal(different, taste));
  const ranked = rankByTaste([liked, different, similar], taste);
  expect(ranked.map((m) => m.idMeal)).toEqual(["2", "3"]); // "1" was already seen
});
