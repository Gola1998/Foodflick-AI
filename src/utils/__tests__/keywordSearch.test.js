import { getKeywords, keywordRank } from "../keywordSearch";

test("removes filler words and short words", () => {
  expect(getKeywords("Something spicy and light!")).toEqual(["spicy", "light"]);
});

test("ranks dishes by how many query words they contain", () => {
  const docs = [
    { id: "1", text: "Sweet chocolate cake" },
    { id: "2", text: "Spicy chicken curry, light coconut" },
    { id: "3", text: "Spicy beef stew" },
  ];
  const result = keywordRank("spicy light", docs);
  expect(result.map((r) => r.id)).toEqual(["2", "3"]); // 1 has no match, so it is dropped
  expect(result[0].score).toBe(1);
  expect(result[1].score).toBe(0.5);
});

test("a query with only filler words returns nothing", () => {
  expect(keywordRank("something with the", [{ id: "1", text: "anything" }])).toEqual([]);
});
