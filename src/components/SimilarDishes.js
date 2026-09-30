import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RestaurantCard from "./RestaurantCard";
import makeRestaurant from "../utils/makeRestaurant";
import { getMealById, getMealsByCategory } from "../utils/mealCache";
import { rankSimilar } from "../utils/recommend";

// "You may also like" section on the dish page.
// Steps:
// 1. get other dishes of the same category
// 2. download the ingredients of 10 of them
// 3. score each one against the current dish and show the top 4
const SimilarDishes = ({ meal }) => {
  const [similar, setSimilar] = useState(null); // null = still loading

  useEffect(() => {
    let cancelled = false; // if the user leaves the page, do not update state

    const load = async () => {
      try {
        const list = await getMealsByCategory(meal.strCategory);
        const others = list.filter((m) => m.idMeal !== meal.idMeal).slice(0, 10);

        // Promise.all sends all 10 requests at the same time (faster)
        const fullMeals = await Promise.all(others.map((m) => getMealById(m.idMeal)));

        if (!cancelled) {
          setSimilar(rankSimilar(meal, fullMeals.filter(Boolean)));
        }
      } catch (error) {
        console.log(error);
        if (!cancelled) setSimilar([]);
      }
    };

    setSimilar(null);
    load();

    return () => {
      cancelled = true;
    };
  }, [meal.idMeal]);

  if (similar === null) {
    return <p className="mt-10 text-gray-500">🤖 Finding similar dishes...</p>;
  }
  if (similar.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-1">🤖 You may also like</h2>
      <p className="text-sm text-gray-500 mb-4">
        Picked by comparing ingredients with this dish.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {similar.map(({ meal: m, shared }) => (
          <div key={m.idMeal} className="flex flex-col">
            <Link to={"/restaurant/" + m.idMeal} className="flex-1">
              <RestaurantCard resData={makeRestaurant(m)} />
            </Link>
            <p className="text-xs text-gray-500 mt-2">
              {shared.length > 0
                ? shared.length + " shared: " + shared.slice(0, 3).join(", ")
                : "Same category"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarDishes;
