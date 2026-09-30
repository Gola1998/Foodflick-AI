// TheMealDB only gives us a dish name and a photo.
// So we create the restaurant name, rating, time and price from the dish id.
// Same id always gives the same values, so nothing changes on refresh.

const restaurantNames = [
  "Spice Garden",
  "Tasty Bites",
  "Royal Kitchen",
  "Food Hub",
  "Urban Tadka",
  "The Hungry Chef",
  "Flavour Street",
  "Curry House",
];

const makeRestaurant = (meal) => {
  const id = Number(meal.idMeal);

  return {
    id: meal.idMeal,
    restaurantName: restaurantNames[id % restaurantNames.length],
    dishName: meal.strMeal,
    image: meal.strMealThumb,
    rating: (35 + (id % 15)) / 10, // between 3.5 and 4.9
    deliveryTime: 20 + (id % 5) * 5, // between 20 and 40 minutes
    price: 150 + (id % 10) * 20, // between 150 and 330
    category: meal.strCategory, // only filled when we have the full meal (used by the cart advisor)
    area: meal.strArea,
  };
};

export default makeRestaurant;
