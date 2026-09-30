import { similarityScore, rankSimilar } from "../recommend";

const makeMeal = (id, ingredients) => {
  const meal = { idMeal: id };
  ingredients.forEach((name, i) => {
    meal["strIngredient" + (i + 1)] = name;
  });
  return meal;
};

test("shared ingredients give the right Jaccard score", () => {
  const a = makeMeal("1", ["Chicken", "Rice", "Onion"]);
  const b = makeMeal("2", ["Chicken", "Rice", "Peas"]);
  const result = similarityScore(a, b);
  expect(result.shared).toEqual(["chicken", "rice"]);
  expect(result.score).toBe(0.5); // 2 shared / 4 total
});

test("salt and oil are ignored", () => {
  const a = makeMeal("1", ["Salt", "Olive Oil", "Rice"]);
  const b = makeMeal("2", ["Salt", "Olive Oil", "Peas"]);
  expect(similarityScore(a, b).shared).toEqual([]);
});

test("rankSimilar removes the same dish and sorts best first", () => {
  const main = makeMeal("1", ["Chicken", "Rice"]);
  const far = makeMeal("2", ["Beef", "Potato"]);
  const near = makeMeal("3", ["Chicken", "Rice", "Peas"]);
  const result = rankSimilar(main, [main, far, near]);
  expect(result.map((r) => r.meal.idMeal)).toEqual(["3", "2"]);
});
