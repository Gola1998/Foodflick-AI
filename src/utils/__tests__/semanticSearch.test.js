// We replace the real AI model with a fake one, so this test is instant
// and needs no download. It checks OUR logic: caching, ranking and the fallback.
jest.mock("../ml", () => ({ embedTexts: jest.fn() }));

import { embedTexts } from "../ml";
import { smartSearch } from "../semanticSearch";

const meal = (id, name) => ({ idMeal: id, strMeal: name, strCategory: "Main", strArea: "Test" });

test("ranks dishes using the vectors from the model", async () => {
  // dish texts come first, then the query
  embedTexts
    .mockResolvedValueOnce([[1, 0], [0, 1]]) // dish A points "right", dish B points "up"
    .mockResolvedValueOnce([[0, 1]]); // the query points "up"

  const { results, usedAI } = await smartSearch("anything", [meal("a1", "Dish A"), meal("b1", "Dish B")]);

  expect(usedAI).toBe(true);
  expect(results[0].id).toBe("b1"); // B is closest to the query
});

test("does not embed the same dish twice", async () => {
  embedTexts.mockClear();
  embedTexts.mockResolvedValueOnce([[0, 1]]); // only the query needs embedding now

  await smartSearch("again", [meal("a1", "Dish A"), meal("b1", "Dish B")]);

  expect(embedTexts).toHaveBeenCalledTimes(1);
});

test("falls back to keyword search when the model fails", async () => {
  embedTexts.mockRejectedValueOnce(new Error("offline"));
  jest.spyOn(console, "log").mockImplementation(() => {});

  const { results, usedAI } = await smartSearch("pasta", [
    meal("n1", "Fresh pasta bake"),
    meal("n2", "Grilled fish"),
  ]);

  expect(usedAI).toBe(false);
  expect(results.map((r) => r.id)).toEqual(["n1"]);
});
