import { planMeal } from "../mealPlanner";

const dish = (name, price, rating) => ({ name, price, rating });

const mains = [dish("cheap main", 150, 4.0), dish("best main", 300, 4.8)];
const starters = [dish("starter", 100, 4.0)];
const desserts = [dish("dessert", 100, 4.5)];

test("plan never goes above the budget", () => {
  const plan = planMeal(2, 900, mains, starters, desserts);
  expect(plan.cost).toBeLessThanOrEqual(900);
});

test("big budget -> best main plus starter and dessert", () => {
  const plan = planMeal(2, 2000, mains, starters, desserts);
  expect(plan.main.name).toBe("best main");
  expect(plan.starter.name).toBe("starter");
  expect(plan.dessert.name).toBe("dessert");
  expect(plan.cost).toBe(300 * 2 + 100 + 100);
});

test("tight budget -> main only", () => {
  const plan = planMeal(2, 300, mains, starters, desserts);
  expect(plan.main.name).toBe("cheap main");
  expect(plan.starter).toBe(null);
  expect(plan.dessert).toBe(null);
});

test("budget too low -> no plan", () => {
  expect(planMeal(2, 100, mains, starters, desserts)).toBe(null);
});
