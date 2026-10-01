import { cleanVoiceText } from "../useVoiceSearch";

test("removes the sentence around the dish word", () => {
  expect(cleanVoiceText("Show me pasta")).toBe("pasta");
  expect(cleanVoiceText("Search for chicken curry.")).toBe("chicken curry");
  expect(cleanVoiceText("I want to eat pizza")).toBe("pizza");
});

test("removes some / a / the and a trailing please", () => {
  expect(cleanVoiceText("Show me some pasta please")).toBe("pasta");
  expect(cleanVoiceText("find a cake")).toBe("cake");
});

test("a plain dish name stays the same", () => {
  expect(cleanVoiceText("Lasagne")).toBe("lasagne");
});
