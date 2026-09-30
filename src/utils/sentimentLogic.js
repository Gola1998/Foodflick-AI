// FEATURE: Review sentiment - the logic part (no AI model in this file)
//
// The model (DistilBERT, trained on movie reviews) answers with only two labels:
//   POSITIVE or NEGATIVE, plus a confidence between 0 and 1.
// We add a third mood, "neutral": when the model is NOT sure, we call it neutral.

// Below this confidence we say "neutral". You can tune this number.
export const NEUTRAL_BELOW = 0.8;

export const SENTIMENT_UI = {
  positive: { emoji: "😊", text: "Positive", classes: "bg-green-100 text-green-700" },
  neutral: { emoji: "😐", text: "Neutral", classes: "bg-gray-100 text-gray-700" },
  negative: { emoji: "😞", text: "Negative", classes: "bg-red-100 text-red-700" },
};

// Turn the raw model answer { label: "POSITIVE", score: 0.97 } into our 3 labels
export const fromModelOutput = (output) => {
  const score = output.score;
  if (score < NEUTRAL_BELOW) return { label: "neutral", score };
  return { label: output.label === "POSITIVE" ? "positive" : "negative", score };
};

// FALLBACK when the model cannot load: count happy words and sad words
const GOOD_WORDS = [
  "good", "great", "amazing", "delicious", "tasty", "love", "loved", "excellent",
  "perfect", "yummy", "fresh", "best", "awesome", "fantastic", "wonderful", "nice",
];
const BAD_WORDS = [
  "bad", "worst", "terrible", "awful", "bland", "cold", "stale", "raw", "salty",
  "disgusting", "hate", "hated", "poor", "slow", "late", "boring", "greasy",
];

export const fallbackSentiment = (text) => {
  const words = text.toLowerCase().split(/[^a-z]+/);
  const good = words.filter((w) => GOOD_WORDS.includes(w)).length;
  const bad = words.filter((w) => BAD_WORDS.includes(w)).length;

  if (good > bad) return { label: "positive", score: 0.7 };
  if (bad > good) return { label: "negative", score: 0.7 };
  return { label: "neutral", score: 0.5 };
};

// Average for one dish. positive = +1, neutral = 0, negative = -1.
// Example: 2 positive + 1 negative = (1 + 1 - 1) / 3 = 0.33  ->  "Mostly positive"
export const summarizeReviews = (reviews) => {
  if (reviews.length === 0) return null;

  const points = { positive: 1, neutral: 0, negative: -1 };
  const total = reviews.reduce((sum, r) => sum + points[r.label], 0);
  const average = total / reviews.length;

  let label = "neutral";
  if (average > 0.25) label = "positive";
  if (average < -0.25) label = "negative";

  return {
    label,
    average,
    count: reviews.length,
    positiveCount: reviews.filter((r) => r.label === "positive").length,
  };
};
