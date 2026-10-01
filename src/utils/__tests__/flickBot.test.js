import { INTENTS, detectIntentByKeywords, buildAnswer, askFlickBot } from "../flickBot";
import { embedTexts } from "../ml";

// we do not download the real AI model in tests
jest.mock("../ml", () => ({ embedTexts: jest.fn() }));

const curry = { idMeal: "1", strMeal: "Chicken Curry", strCategory: "Chicken", strIngredient1: "Chicken", strIngredient2: "Milk" };
const dish = {
  restaurant: { dishName: "Chicken Curry", price: 200, deliveryTime: 30, rating: 4.2 },
  meal: curry,
};
const cart = [
  { dishName: "Cake", price: 100, deliveryTime: 20, isVeg: true },
  { dishName: "Soup", price: 150, deliveryTime: 35, isVeg: true },
];

describe("keyword rules", () => {
  test("finds the intent from keywords", () => {
    expect(detectIntentByKeywords("How much is it?")).toBe("price");
    expect(detectIntentByKeywords("Is this vegetarian?")).toBe("veg");
    expect(detectIntentByKeywords("what is in my cart")).toBe("cart");
  });

  test("'nuts' means allergy, but 'minutes' does not", () => {
    expect(detectIntentByKeywords("does it have nuts")).toBe("allergy");
    expect(detectIntentByKeywords("how many minutes")).toBe("time");
  });

  test("returns null when nothing matches", () => {
    expect(detectIntentByKeywords("blah blah")).toBeNull();
  });
});

describe("answers", () => {
  test("dish questions use the open dish", () => {
    expect(buildAnswer("veg", { dish, cart: [] })).toContain("non-vegetarian");
    expect(buildAnswer("allergy", { dish, cart: [] })).toContain("dairy");
    expect(buildAnswer("price", { dish, cart: [] })).toContain("₹200");
  });

  test("cart questions add up the cart", () => {
    expect(buildAnswer("cart", { dish: null, cart })).toContain("₹250");
    expect(buildAnswer("price", { dish: null, cart })).toContain("₹250");
    expect(buildAnswer("time", { dish: null, cart })).toContain("35");
    expect(buildAnswer("veg", { dish: null, cart })).toContain("vegetarian");
  });

  test("empty cart and no dish", () => {
    expect(buildAnswer("cart", { dish: null, cart: [] })).toContain("empty");
    expect(buildAnswer("price", { dish: null, cart: [] })).toContain("Open a dish");
    expect(buildAnswer(null, { dish: null, cart: [] })).toContain("not sure");
  });
});

describe("askFlickBot", () => {
  test("falls back to the rules when the AI model cannot load", async () => {
    embedTexts.mockRejectedValue(new Error("offline"));
    const result = await askFlickBot("how much is it", { dish, cart: [] });
    expect(result.usedAI).toBe(false);
    expect(result.answer).toContain("₹200");
  });

  test("uses the AI intent when the model works", async () => {
    // fake vectors: every example is its own direction, the question points at "cart"
    const cartIndex = INTENTS.findIndex((intent) => intent.id === "cart");
    const unit = (i) => INTENTS.map((_, n) => (n === i ? 1 : 0));
    embedTexts.mockImplementation(async (texts) =>
      texts.length > 1 ? texts.map((_, i) => unit(i)) : [unit(cartIndex)]
    );

    // the words say nothing about a cart, so only the AI can find the intent
    const result = await askFlickBot("what did I pick so far", { dish: null, cart });
    expect(result.usedAI).toBe(true);
    expect(result.answer).toContain("₹250");
  });

  test("asks the rules when the AI is not sure", async () => {
    // question vector is far from every example (score 0), so the AI returns null
    embedTexts.mockImplementation(async (texts) =>
      texts.length > 1 ? texts.map((_, i) => INTENTS.map((__, n) => (n === i ? 1 : 0))) : [INTENTS.map(() => 0)]
    );
    const result = await askFlickBot("price please", { dish, cart: [] });
    expect(result.answer).toContain("₹200");
  });
});
