// FEATURE: Smart cart suggestions (rule-based recommendation)
// Idea: a complete meal has a starter, a main and a dessert.
// Look at what is in the cart and find which course is missing.

const isDessert = (item) => item.category === "Dessert";
const isStarter = (item) => item.category === "Starter" || item.category === "Side";
const isMain = (item) => !isDessert(item) && !isStarter(item);

// Returns "Dessert", "Starter" or null (nothing to suggest)
export const findMissingCourse = (cartItems) => {
  if (cartItems.length === 0) return null;
  if (!cartItems.some(isMain)) return null; // only suggest when a main is there

  if (!cartItems.some(isDessert)) return "Dessert";
  if (!cartItems.some(isStarter)) return "Starter";
  return null;
};
