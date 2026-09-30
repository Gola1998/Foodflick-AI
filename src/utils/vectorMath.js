// FEATURE: Semantic search - the maths part (vector search)
//
// An "embedding" turns a sentence into a list of numbers (384 numbers for our model).
// Sentences with a similar MEANING get similar numbers, even with different words.
//   "something spicy"  ~  "Chicken curry with chilli"
//
// To compare two sentences we compare their lists with COSINE SIMILARITY:
// the angle between the two lists. 1 = same meaning, 0 = unrelated.

// Our model gives "normalized" vectors (length = 1).
// For those, cosine similarity is simply: multiply each pair and add them up.
// We still divide by the lengths so this also works for any other vectors.
export const cosineSimilarity = (a, b) => {
  let dot = 0;
  let lengthA = 0;
  let lengthB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    lengthA += a[i] * a[i];
    lengthB += b[i] * b[i];
  }

  if (lengthA === 0 || lengthB === 0) return 0; // avoid dividing by zero
  return dot / (Math.sqrt(lengthA) * Math.sqrt(lengthB));
};

// Score every item against the query and return the best ones.
// items: [{ id: "52772", vector: [...] }, ...]
// returns: [{ id, score }, ...] with the highest score first
export const rankBySimilarity = (queryVector, items, topN = 8) => {
  return items
    .map((item) => ({ id: item.id, score: cosineSimilarity(queryVector, item.vector) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, topN);
};
