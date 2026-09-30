import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { additem } from "../utils/cartSlice";
import makeRestaurant from "../utils/makeRestaurant";
import { getMealById, getMealsByCategory } from "../utils/mealCache";
import { analyzeMeal } from "../utils/allergens";
import { planMeal } from "../utils/mealPlanner";

const styles = ["Vegetarian", "Chicken", "Beef", "Seafood", "Pasta", "Lamb", "Pork"];

// keep only the 12 best rated dishes so the search stays fast
const topRated = (items) => [...items].sort((a, b) => b.rating - a.rating).slice(0, 12);

// keep only vegetarian dishes (we download ingredients and check them)
const keepVeg = async (items) => {
  const meals = await Promise.all(items.map((item) => getMealById(item.id)));
  return items.filter((item, i) => meals[i] && analyzeMeal(meals[i]).isVeg);
};

// One row of the final plan
const PlanRow = ({ label, item, count = 1 }) => (
  <Link
    to={"/restaurant/" + item.id}
    className="flex items-center gap-4 py-3 border-b border-gray-200"
  >
    <img src={item.image + "/small"} alt={item.dishName} className="w-20 h-16 object-cover rounded" />
    <div className="flex-1">
      <p className="text-xs font-semibold text-orange-600 uppercase">{label}</p>
      <p className="font-bold text-gray-800">{item.dishName}</p>
      <p className="text-sm text-gray-500">
        {item.restaurantName} • {item.rating} ⭐
      </p>
    </div>
    <div className="text-right font-bold text-gray-800">
      ₹{item.price * count}
      {count > 1 && (
        <span className="block text-xs font-normal text-gray-500">
          {count} × ₹{item.price}
        </span>
      )}
    </div>
  </Link>
);

const MealPlanner = () => {
  const dispatch = useDispatch();
  const [people, setPeople] = useState(2);
  const [budget, setBudget] = useState(800);
  const [style, setStyle] = useState("Vegetarian");
  const [plan, setPlan] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    setPlan(null);
    setMessage("");
    setAdded(false);

    try {
      // 1. download the three lists at the same time
      const [mainList, starterList, dessertList] = await Promise.all([
        getMealsByCategory(style),
        getMealsByCategory("Starter"),
        getMealsByCategory("Dessert"),
      ]);

      // 2. turn them into cards with price and rating
      const mains = topRated(mainList.map(makeRestaurant));
      let starters = topRated(starterList.map(makeRestaurant));
      let desserts = topRated(dessertList.map(makeRestaurant));

      // 3. vegetarian people must not get a non-veg starter or dessert
      if (style === "Vegetarian") {
        starters = await keepVeg(starters);
        desserts = await keepVeg(desserts);
      }

      // 4. let the planner find the best combination
      const result = planMeal(people, budget, mains, starters, desserts);

      if (result) {
        setPlan(result);
      } else if (mains.length > 0) {
        const cheapest = Math.min(...mains.map((m) => m.price)) * people;
        setMessage("Budget is too low. For " + people + " people, try at least ₹" + cheapest + ".");
      } else {
        setMessage("Could not load dishes. Please try again.");
      }
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  // Put the whole plan in the cart (main is added once per person)
  const addPlanToCart = () => {
    const isVeg = style === "Vegetarian" ? true : undefined;

    for (let i = 0; i < people; i++) {
      dispatch(additem({ ...plan.main, category: style, isVeg }));
    }
    if (plan.starter) dispatch(additem({ ...plan.starter, category: "Starter", isVeg }));
    if (plan.dessert) dispatch(additem({ ...plan.dessert, category: "Dessert", isVeg }));
    setAdded(true);
  };

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center text-gray-800">🤖 AI Meal Planner</h1>
      <p className="text-center text-gray-500 mt-1 mb-6">
        Tell us how many people and your budget. We find the best rated meal that fits.
      </p>

      {/* Inputs */}
      <div className="flex flex-wrap justify-center items-end gap-4 mb-6">
        <label className="text-sm font-semibold text-gray-700">
          People
          <select
            className="block mt-1 px-4 py-3 border border-gray-300 rounded-md"
            value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold text-gray-700">
          Budget (₹)
          <input
            type="number"
            min="100"
            step="50"
            className="block mt-1 w-32 px-4 py-3 border border-gray-300 rounded-md"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
        </label>

        <label className="text-sm font-semibold text-gray-700">
          Main dish type
          <select
            className="block mt-1 px-4 py-3 border border-gray-300 rounded-md"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            {styles.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <button
          className="bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition disabled:opacity-50"
          onClick={generatePlan}
          disabled={loading}
        >
          {loading ? "Planning..." : "Plan my meal"}
        </button>
      </div>

      {message && <p className="text-center text-red-500 font-semibold">{message}</p>}

      {/* Result */}
      {plan && (
        <div>
          {plan.starter && <PlanRow label="Starter (shared)" item={plan.starter} />}
          <PlanRow label={"Main (for " + people + ")"} item={plan.main} count={people} />
          {plan.dessert && <PlanRow label="Dessert (shared)" item={plan.dessert} />}

          <div className="flex flex-wrap justify-between items-center mt-4 gap-3">
            <div>
              <p className="text-xl font-bold text-gray-800">Total: ₹{plan.cost}</p>
              <p className="text-sm text-green-600 font-semibold">₹{budget - plan.cost} left in your budget</p>
            </div>

            {added ? (
              <Link to="/cart" className="font-semibold text-orange-600">
                ✅ Added! Go to cart →
              </Link>
            ) : (
              <button
                className="bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition"
                onClick={addPlanToCart}
              >
                Add all to cart
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
