// FEATURE: Search by food photo (zero-shot image classification with CLIP).
// CLIP understands photos AND text in the same "language", so we never train it on
// our dishes. We give it the photo plus the names of our dishes, and it tells us
// which name fits the photo best.

import { getPipeline } from "./ml";

// imageUrl = the chosen photo, restaurants = the dishes of the selected cuisine
// returns [{ restaurant, score }] with the best match first
export const searchByPhoto = async (imageUrl, restaurants, topN = 6) => {
  const classifier = await getPipeline("clip");
  const labels = restaurants.map((res) => res.dishName);

  // {} is replaced by each dish name, a full sentence works better than a bare name
  const output = await classifier(imageUrl, labels, {
    hypothesis_template: "a photo of {}, a plate of food",
  });

  return output
    .sort((x, y) => y.score - x.score)
    .slice(0, topN)
    .map((item) => ({
      restaurant: restaurants.find((res) => res.dishName === item.label),
      score: item.score,
    }));
};
