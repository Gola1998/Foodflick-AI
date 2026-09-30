// FEATURE: AI budget meal planner (constraint optimization)
// Problem: "Plan a meal for 2 people under Rs 700".
// Rules:  every person gets one main dish, plus one starter and one dessert
//         that everyone shares.
// Method: try EVERY combination, throw away the ones above budget,
//         and keep the one with the best total rating.
// (The lists are small, so trying everything is fast and easy to explain.)

export const planMeal = (people, budget, mains, starters, desserts) => {
  // null means "skip this course". This lets us still make a plan
  // (main only, or main + dessert) when the budget is tight.
  const starterOptions = [null, ...starters];
  const dessertOptions = [null, ...desserts];

  let best = null;

  for (const main of mains) {
    for (const starter of starterOptions) {
      for (const dessert of dessertOptions) {
        const cost =
          main.price * people +
          (starter ? starter.price : 0) +
          (dessert ? dessert.price : 0);

        if (cost > budget) continue; // too expensive, skip

        // main counts double, and every extra course adds to the score,
        // so a fuller meal wins whenever it fits the budget
        const score =
          main.rating * 2 +
          (starter ? starter.rating : 0) +
          (dessert ? dessert.rating : 0);

        const isBetter =
          best === null ||
          score > best.score ||
          (score === best.score && cost < best.cost); // same score: cheaper wins

        if (isBetter) {
          best = { main, starter, dessert, cost, score };
        }
      }
    }
  }

  return best; // null when even the cheapest main is too expensive
};
