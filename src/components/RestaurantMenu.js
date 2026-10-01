import { useEffect } from "react";
import Shimmer from "./Shimmer";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import useRestaurantMenu from "../utils/useRestaurantMenu";
import makeRestaurant from "../utils/makeRestaurant";
import { additem } from "../utils/cartSlice";
import { analyzeMeal } from "../utils/allergens";
import DietBadges from "./DietBadges";
import SimilarDishes from "./SimilarDishes";
import Reviews from "./Reviews";
import { recordActivity } from "../utils/tasteProfile";

const RestaurantMenu = () => {
  const { resId } = useParams();
  const resInfo = useRestaurantMenu(resId);
  const dispatch = useDispatch();

  // when the user clicks a similar dish, start again from the top of the page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [resId]);

  // AI: remember that the user looked at this dish (the "For You" section learns from it)
  useEffect(() => {
    if (resInfo) recordActivity(resInfo, 1);
  }, [resInfo]);

  if (resInfo == null) return <Shimmer />;

  const restaurant = makeRestaurant(resInfo);
  const { restaurantName, dishName, image, rating, deliveryTime, price } = restaurant;

  // The API gives strIngredient1 ... strIngredient20, so we loop and collect the filled ones
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = resInfo["strIngredient" + i];
    if (name) {
      ingredients.push({ name: name, measure: resInfo["strMeasure" + i] });
    }
  }

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <Link to="/" className="inline-block mb-4 text-sm font-semibold text-orange-600 hover:text-orange-800">
        ← Back to dishes
      </Link>

      {/* Top card: photo on the left, details on the right (stacked on phones) */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <img src={image} alt={dishName} className="w-full h-64 md:h-full object-cover" />

        <div className="p-6 md:p-8 flex flex-col">
          <p className="text-sm text-gray-500">🏪 {restaurantName}</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mt-1">{dishName}</h1>

          <div className="flex flex-wrap gap-2 mt-3 text-sm font-medium">
            <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600">
              {resInfo.strCategory} • {resInfo.strArea}
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">⭐ {rating}</span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">🕒 {deliveryTime} min</span>
          </div>

          {/* AI: Veg / Non-Veg and allergen badges */}
          <DietBadges meal={resInfo} />

          {/* Price and button stay at the bottom of the card */}
          <div className="mt-auto pt-6 flex items-center justify-between gap-4">
            <span className="text-3xl font-extrabold text-orange-600">₹{price}</span>
            <button
              className="bg-orange-500 text-white font-semibold px-8 py-3 rounded-xl hover:bg-orange-600 transition"
              onClick={() => {
                dispatch(additem({ ...restaurant, isVeg: analyzeMeal(resInfo).isVeg }));
                recordActivity(resInfo, 3); // adding to the cart says more than just looking
              }}
            >
              Add to cart +
            </button>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 mt-6">
        <h2 className="text-xl font-bold mb-3">🧂 Ingredients</h2>
        <ul className="grid sm:grid-cols-2 gap-x-10 text-gray-700">
          {ingredients.map((item, index) => (
            <li key={index} className="flex justify-between gap-4 py-2 border-b border-gray-100">
              <span>{item.name}</span>
              <span className="text-gray-500 text-right">{item.measure}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 mt-6">
        <h2 className="text-xl font-bold mb-3">👩‍🍳 Instructions</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{resInfo.strInstructions}</p>
      </div>

      {/* AI: reviews with sentiment badges (😊 / 😐 / 😞) */}
      <Reviews mealId={resInfo.idMeal} />

      {/* AI: dishes with similar ingredients */}
      <SimilarDishes meal={resInfo} />
    </div>
  );
};

export default RestaurantMenu;
