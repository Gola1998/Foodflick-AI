import { useEffect } from "react";
import Shimmer from "./Shimmer";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import useRestaurantMenu from "../utils/useRestaurantMenu";
import makeRestaurant from "../utils/makeRestaurant";
import { additem } from "../utils/cartSlice";
import { analyzeMeal } from "../utils/allergens";
import DietBadges from "./DietBadges";
import SimilarDishes from "./SimilarDishes";
import Reviews from "./Reviews";

const RestaurantMenu = () => {
  const { resId } = useParams();
  const resInfo = useRestaurantMenu(resId);
  const dispatch = useDispatch();

  // when the user clicks a similar dish, start again from the top of the page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [resId]);

  if (resInfo == null) return <Shimmer />;

  const restaurant = makeRestaurant(resInfo);
  const { restaurantName, dishName, image, rating, deliveryTime, price } = restaurant;

  // The API gives strIngredient1 ... strIngredient20, so we loop and collect the filled ones
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = resInfo["strIngredient" + i];
    if (name) {
      ingredients.push(name + " - " + resInfo["strMeasure" + i]);
    }
  }

  return (
    <div className="px-4 md:px-10 py-6 max-w-5xl mx-auto">
      {/* Restaurant Info Section */}
      <div className="text-center mb-8">
        <h1 className="font-extrabold text-3xl text-gray-800">{restaurantName}</h1>
        <p className="text-gray-600 mt-2 text-lg">
          {rating} ⭐ • {deliveryTime} min • ₹{price}
        </p>
      </div>

      {/* Dish Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <img src={image} alt={dishName} className="w-full md:w-80 rounded-lg shadow" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{dishName}</h2>
          <p className="text-gray-500 mt-1">
            {resInfo.strCategory} • {resInfo.strArea}
          </p>

          {/* AI: Veg / Non-Veg and allergen badges */}
          <DietBadges meal={resInfo} />
          <button
            className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition"
            onClick={() => dispatch(additem({ ...restaurant, isVeg: analyzeMeal(resInfo).isVeg }))}
          >
            Add to cart +
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-3">Ingredients</h2>
      <ul className="list-disc pl-6 text-gray-700">
        {ingredients.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h2 className="text-xl font-bold mt-8 mb-3">Instructions</h2>
      <p className="text-gray-700 whitespace-pre-line">{resInfo.strInstructions}</p>

      {/* AI: reviews with sentiment badges (😊 / 😐 / 😞) */}
      <Reviews mealId={resInfo.idMeal} />

      {/* AI: dishes with similar ingredients */}
      <SimilarDishes meal={resInfo} />
    </div>
  );
};

export default RestaurantMenu;
