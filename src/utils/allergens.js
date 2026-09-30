// FEATURE: Diet and allergen detector (rule-based NLP)
// Idea: read the ingredient text and look for known words.
// NOTE: this is keyword based, so it is a helpful guess, not a medical guarantee.

import { getIngredients } from "./getIngredients";

// For each allergen: "words" to look for, and "ignore" phrases that look
// similar but are NOT the allergen (example: coconut milk is not dairy).
const ALLERGENS = {
  gluten: {
    words: [
      "flour", "bread", "breadcrumb", "pasta", "spaghetti", "noodle", "wheat",
      "barley", "rye", "couscous", "bulgur", "semolina", "pastry", "biscuit",
      "cracker", "tortilla", "pitta", "naan", "baguette", "ciabatta", "bun",
      "dough", "panko", "lasagne", "macaroni", "penne", "fettuccine",
      "linguine", "tagliatelle", "rigatoni", "fusilli", "orzo", "soy sauce",
    ],
    ignore: ["corn flour", "rice flour", "gram flour", "chickpea flour", "almond flour", "coconut flour", "rice noodle"],
  },
  dairy: {
    words: [
      "milk", "butter", "buttermilk", "cheese", "cream", "yogurt", "yoghurt",
      "ghee", "paneer", "mozzarella", "parmesan", "cheddar", "feta",
      "mascarpone", "ricotta", "custard", "halloumi", "gruyere", "brie",
      "gouda", "camembert", "creme fraiche",
    ],
    ignore: ["coconut milk", "coconut cream", "almond milk", "soy milk", "oat milk", "peanut butter", "almond butter", "cocoa butter", "butter bean", "cream of tartar"],
  },
  // (peanut is technically a legume, but people list it under nut allergy)
  nuts: {
    words: ["peanut", "almond", "cashew", "walnut", "pistachio", "hazelnut", "pecan", "macadamia", "nut"],
    ignore: [],
  },
  egg: {
    words: ["egg", "mayonnaise"],
    ignore: [],
  },
  seafood: {
    words: [
      "fish", "salmon", "tuna", "cod", "haddock", "mackerel", "sardine",
      "anchovy", "anchovies", "prawn", "shrimp", "crab", "lobster", "mussel",
      "clam", "oyster", "squid", "scallop",
    ],
    ignore: [],
  },
};

// Words that make a dish Non-Veg (meat words + all seafood words)
const MEAT_WORDS = [
  "chicken", "beef", "pork", "lamb", "mutton", "goat", "turkey", "duck",
  "bacon", "ham", "sausage", "chorizo", "salami", "prosciutto", "pancetta",
  "steak", "mince", "veal", "venison", "rabbit", "gelatin", "gelatine", "lard",
];
const NON_VEG_WORDS = [...MEAT_WORDS, ...ALLERGENS.seafood.words];

// If TheMealDB itself puts the dish in one of these categories, it is Non-Veg
const NON_VEG_CATEGORIES = ["Beef", "Chicken", "Lamb", "Pork", "Seafood", "Goat"];

// Does the text contain any of the words?
// \b means "word boundary", so "ham" will NOT match inside "graham",
// and "egg" will NOT match inside "eggplant".
const hasWord = (text, words) => {
  const pattern = new RegExp("\\b(" + words.join("|") + ")(s|es)?\\b");
  return pattern.test(text);
};

// Remove the "look-alike" phrases first, then search
const containsAllergen = (text, rule) => {
  let cleanText = text;
  rule.ignore.forEach((phrase) => {
    cleanText = cleanText.split(phrase).join("");
  });
  return hasWord(cleanText, rule.words);
};

// MAIN FUNCTION: give it a full meal from the API, get back diet info.
// Returns: { isVeg: true/false, allergens: ["gluten", "dairy"] }
export const analyzeMeal = (meal) => {
  const text = getIngredients(meal).join(" , ");

  // When in doubt we say Non-Veg, because that is the safer mistake
  const isVeg =
    !NON_VEG_CATEGORIES.includes(meal.strCategory) && !hasWord(text, NON_VEG_WORDS);

  const allergens = Object.keys(ALLERGENS).filter((name) =>
    containsAllergen(text, ALLERGENS[name])
  );

  return { isVeg, allergens };
};
