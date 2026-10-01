import { searchByPhoto } from "../photoSearch";
import { getPipeline } from "../ml";

// we do not download the real photo model in tests
jest.mock("../ml", () => ({ getPipeline: jest.fn() }));

test("returns the dishes best match first, with their scores", async () => {
  const classifier = jest.fn().mockResolvedValue([
    { label: "Pizza", score: 0.2 },
    { label: "Lasagne", score: 0.7 },
    { label: "Risotto", score: 0.1 },
  ]);
  getPipeline.mockResolvedValue(classifier);

  const restaurants = [{ dishName: "Pizza" }, { dishName: "Lasagne" }, { dishName: "Risotto" }];
  const items = await searchByPhoto("blob:photo", restaurants, 2);

  expect(classifier.mock.calls[0][1]).toEqual(["Pizza", "Lasagne", "Risotto"]); // labels = dish names
  expect(items.map((i) => i.restaurant.dishName)).toEqual(["Lasagne", "Pizza"]);
  expect(items[0].score).toBe(0.7);
});
