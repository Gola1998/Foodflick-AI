// FALLBACK for Smart Search.
// If the AI model cannot load (offline, blocked network...), we still want
// the feature to work. This is plain keyword matching: no AI, but no crash.

// Words that say nothing about food. We skip them.
const STOP_WORDS = [
  "something", "want", "need", "with", "that", "have", "some", "and", "the",
  "for", "not", "too", "very", "but", "like", "give", "show", "food", "dish",
  "eat", "meal", "feel", "feeling", "today",
];

// "Something spicy and light!" -> ["spicy", "light"]
export const getKeywords = (query) =>
  query
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.includes(word));

// docs: [{ id, text }]  ->  [{ id, score }] (only dishes that match at least 1 word)
export const keywordRank = (query, docs, topN = 8) => {
  const words = getKeywords(query);
  if (words.length === 0) return [];

  return docs
    .map((doc) => {
      const text = doc.text.toLowerCase();
      const matches = words.filter((word) => text.includes(word)).length;
      return { id: doc.id, score: matches / words.length };
    })
    .filter((item) => item.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, topN);
};
