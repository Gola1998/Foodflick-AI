import { cosineSimilarity, rankBySimilarity } from "../vectorMath";

test("same direction = 1, unrelated = 0, opposite = -1", () => {
  expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
  expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1);
});

test("length of the vector does not matter, only the direction", () => {
  expect(cosineSimilarity([1, 1], [5, 5])).toBeCloseTo(1);
});

test("an empty (all zero) vector gives 0 instead of NaN", () => {
  expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
});

test("rankBySimilarity puts the closest item first and respects topN", () => {
  const items = [
    { id: "far", vector: [0, 1] },
    { id: "near", vector: [0.9, 0.1] },
    { id: "exact", vector: [1, 0] },
  ];
  const result = rankBySimilarity([1, 0], items, 2);
  expect(result.map((r) => r.id)).toEqual(["exact", "near"]);
});
