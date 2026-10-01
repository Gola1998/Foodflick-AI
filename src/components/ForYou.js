import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RestaurantCard from "./RestaurantCard";
import makeRestaurant from "../utils/makeRestaurant";
import { getMealById, getMealsByCategory } from "../utils/mealCache";
import { loadTaste, getTopKeys, rankByTaste, clearTaste } from "../utils/tasteProfile";

// FEATURE: "For You" section on the home page.
// Steps:
// 1. read the taste saved in localStorage and take the user's 2 favourite categories
// 2. download the ingredients of some dishes from those categories
// 3. score each dish against the taste and show the best 4
const ForYou = () => {
  const [dishes, setDishes] = useState(null); // null = still loading

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const taste = loadTaste();
      const topCategories = getTopKeys(taste.category, 2);
      if (topCategories.length === 0) {
        setDishes([]); // the user has not viewed anything yet
        return;
      }

      try {
        const lists = await Promise.all(topCategories.map((c) => getMealsByCategory(c)));
        const candidates = lists.flatMap((list) => list.slice(0, 8));
        const meals = await Promise.all(candidates.map((m) => getMealById(m.idMeal)));

        if (!cancelled) {
          setDishes(rankByTaste(meals.filter(Boolean), taste).map(makeRestaurant));
        }
      } catch (error) {
        console.log(error);
        if (!cancelled) setDishes([]);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (dishes === null) return null;

  if (dishes.length === 0) {
    return (
      <p className="bg-orange-50 text-orange-700 rounded-xl px-4 py-3 text-sm mb-8">
        ✨ For You: open a few dishes and add some to your cart. We will learn your taste and show picks here.
      </p>
    );
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-bold">✨ For You</h2>
        <button
          className="text-sm font-semibold text-orange-600"
          onClick={() => {
            clearTaste();
            setDishes([]);
          }}
        >
          Reset my taste
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">Picked from the dishes you viewed and added to your cart.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {dishes.map((restaurant) => (
          <Link key={restaurant.id} to={"/restaurant/" + restaurant.id}>
            <RestaurantCard resData={restaurant} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ForYou;
