// Reviews are saved in the browser (localStorage), one list per dish.
// There is no backend, so reviews stay on this device only.
// try/catch because localStorage can be blocked (private mode) or full.

const keyFor = (mealId) => "foodflick-reviews-" + mealId;

export const getReviews = (mealId) => {
  try {
    return JSON.parse(localStorage.getItem(keyFor(mealId))) || [];
  } catch (error) {
    return [];
  }
};

// Adds a review at the top of the list and returns the new list
export const addReview = (mealId, review) => {
  const updated = [review, ...getReviews(mealId)];
  try {
    localStorage.setItem(keyFor(mealId), JSON.stringify(updated));
  } catch (error) {
    console.log("Could not save review:", error);
  }
  return updated;
};
