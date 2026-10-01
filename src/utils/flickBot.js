// FEATURE: FlickBot - a chat assistant that knows what the user is looking at.
//
// Every question goes through two steps:
//   1. UNDERSTAND - what is the user asking? We call this the "intent" (price, veg, allergy...)
//        first choice = AI: compare the question with one example sentence per intent
//                       (same embedding model as Smart search, so no new download)
//        fallback     = rules: look for keywords like "price" or "allergy"
//   2. ANSWER - plain code writes the answer from real data (the dish page or the cart).
//        The bot only says what the data says, so it never makes up facts.

import { embedTexts } from "./ml";
import { cosineSimilarity } from "./vectorMath";
import { analyzeMeal } from "./allergens";
import { getIngredients } from "./getIngredients";

// words = keywords for the rules. example = a sentence for the AI to compare with.
// If two intents match equally, the one higher in this list wins.
export const INTENTS = [
  { id: "hello", words: ["hello", "hey", "help"], example: "Hello, can you help me?" },
  { id: "veg", words: ["veg", "meat"], example: "Is this dish vegetarian?" },
  { id: "allergy", words: ["allerg", "gluten", "dairy", "lactose", "nut", "egg"], example: "Does it have any allergens like nuts, gluten or dairy?" },
  { id: "ingredients", words: ["ingredient", "made of", "made with", "contain", "inside", "recipe"], example: "What ingredients are in this dish?" },
  { id: "price", words: ["price", "cost", "how much", "expensive", "cheap"], example: "How much does it cost?" },
  { id: "time", words: ["deliver", "how long", "minute", "arrive", "time"], example: "How long will the delivery take?" },
  { id: "rating", words: ["rating", "rated", "stars", "review", "good"], example: "Is this dish rated well by customers?" },
  { id: "cart", words: ["cart", "basket", "total", "order"], example: "What is in my cart and what is my total?" },
];

const MIN_SCORE = 0.35; // below this the AI is not sure, so the rules get a try

// ---------- 1. UNDERSTAND ----------

// Rules: count how many keywords of each intent appear in the question.
// \b means "start of a word", so "nut" matches "nuts" but not "minutes".
export const detectIntentByKeywords = (text) => {
  const lower = text.toLowerCase();
  let best = null;
  let bestCount = 0;

  INTENTS.forEach((intent) => {
    const count = intent.words.filter((word) => new RegExp("\\b" + word).test(lower)).length;
    if (count > bestCount) {
      best = intent.id;
      bestCount = count;
    }
  });
  return best;
};

// AI: the intent whose example sentence has the closest meaning to the question.
let exampleVectors = null; // we embed the examples only once

const detectIntentByAI = async (text) => {
  if (!exampleVectors) {
    exampleVectors = await embedTexts(INTENTS.map((intent) => intent.example));
  }
  const [questionVector] = await embedTexts([text]);

  let best = null;
  let bestScore = MIN_SCORE;
  INTENTS.forEach((intent, i) => {
    const score = cosineSimilarity(questionVector, exampleVectors[i]);
    if (score > bestScore) {
      best = intent.id;
      bestScore = score;
    }
  });
  return best; // null = not sure
};

// ---------- 2. ANSWER ----------

// dish = { restaurant, meal } when a dish page is open, otherwise null
// cart = the items in the cart
export const buildAnswer = (intent, { dish, cart }) => {
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  if (intent === "hello") return "Hi! 👋 Ask me about the dish you are viewing or about your cart.";

  if (intent === "cart") {
    if (cart.length === 0) return "Your cart is empty.";
    return "You have " + cart.length + " item(s): " + cart.map((item) => item.dishName).join(", ") + ". Total: ₹" + total + ".";
  }

  // questions about the dish that is open right now
  if (dish) {
    const { restaurant, meal } = dish;
    const diet = analyzeMeal(meal);

    if (intent === "veg") return restaurant.dishName + " is " + (diet.isVeg ? "vegetarian 🥦." : "non-vegetarian 🍗.");
    if (intent === "allergy") {
      return diet.allergens.length > 0
        ? "It may contain: " + diet.allergens.join(", ") + "."
        : "I found no common allergens in the ingredients. This is a keyword check, so please confirm with the restaurant.";
    }
    if (intent === "ingredients") return "Ingredients: " + getIngredients(meal).join(", ") + ".";
    if (intent === "price") return restaurant.dishName + " costs ₹" + restaurant.price + ".";
    if (intent === "time") return "Delivery takes about " + restaurant.deliveryTime + " minutes.";
    if (intent === "rating") return "It is rated " + restaurant.rating + " ⭐.";
  }

  // no dish is open, but some questions still make sense for the cart
  if (cart.length > 0) {
    if (intent === "price") return "Your cart total is ₹" + total + ".";
    if (intent === "time") return "Your order would arrive in about " + Math.max(...cart.map((item) => item.deliveryTime)) + " minutes.";
    if (intent === "veg") {
      return cart.every((item) => item.isVeg) ? "Everything in your cart is vegetarian 🥦." : "Your cart is not fully vegetarian.";
    }
  }

  if (intent) return "Open a dish page and ask me again, and I can answer that 🙂";
  return "I am not sure I got that 🤔 Try: \"Is this vegetarian?\", \"Any allergens?\" or \"What is my cart total?\"";
};

// ---------- Put it together ----------

// Returns { answer, usedAI }. usedAI is false when the AI model could not load.
export const askFlickBot = async (question, context) => {
  let intent = null;
  let usedAI = true;

  try {
    intent = await detectIntentByAI(question);
  } catch (error) {
    console.log("AI model unavailable, FlickBot uses rules instead:", error);
    usedAI = false;
  }

  if (!intent) intent = detectIntentByKeywords(question); // fallback

  return { answer: buildAnswer(intent, context), usedAI };
};
