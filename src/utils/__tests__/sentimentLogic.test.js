import { fromModelOutput, fallbackSentiment, summarizeReviews, NEUTRAL_BELOW } from "../sentimentLogic";

test("a confident model answer keeps its label", () => {
  expect(fromModelOutput({ label: "POSITIVE", score: 0.98 }).label).toBe("positive");
  expect(fromModelOutput({ label: "NEGATIVE", score: 0.95 }).label).toBe("negative");
});

test("an unsure model answer becomes neutral", () => {
  expect(fromModelOutput({ label: "POSITIVE", score: NEUTRAL_BELOW - 0.01 }).label).toBe("neutral");
});

test("fallback counts happy and sad words", () => {
  expect(fallbackSentiment("Absolutely delicious and fresh!").label).toBe("positive");
  expect(fallbackSentiment("Cold, bland and too salty").label).toBe("negative");
  expect(fallbackSentiment("I ate it on Tuesday").label).toBe("neutral");
});

test("no reviews = no summary", () => {
  expect(summarizeReviews([])).toBeNull();
});

test("summary averages the reviews", () => {
  const reviews = [{ label: "positive" }, { label: "positive" }, { label: "negative" }];
  const summary = summarizeReviews(reviews);
  expect(summary.average).toBeCloseTo(1 / 3);
  expect(summary.label).toBe("positive");
  expect(summary.positiveCount).toBe(2);
  expect(summary.count).toBe(3);
});

test("a mix of good and bad is neutral", () => {
  const summary = summarizeReviews([{ label: "positive" }, { label: "negative" }]);
  expect(summary.label).toBe("neutral");
});
