import { findMissingCourse } from "../cartAdvisor";

test("empty cart gives no suggestion", () => {
  expect(findMissingCourse([])).toBe(null);
});

test("a main dish only -> suggest dessert", () => {
  expect(findMissingCourse([{ category: "Chicken" }])).toBe("Dessert");
});

test("main + dessert -> suggest starter", () => {
  expect(findMissingCourse([{ category: "Beef" }, { category: "Dessert" }])).toBe("Starter");
});

test("complete meal -> nothing to suggest", () => {
  const cart = [{ category: "Pasta" }, { category: "Dessert" }, { category: "Starter" }];
  expect(findMissingCourse(cart)).toBe(null);
});

test("only a dessert -> no suggestion (no main yet)", () => {
  expect(findMissingCourse([{ category: "Dessert" }])).toBe(null);
});
