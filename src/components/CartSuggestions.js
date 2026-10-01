import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { additem } from "../utils/cartSlice";
import makeRestaurant from "../utils/makeRestaurant";
import { findMissingCourse } from "../utils/cartAdvisor";
import { getMealById, getMealsByCategory } from "../utils/mealCache";
import { analyzeMeal } from "../utils/allergens";

const messages = {
  Dessert: "🍰 Your meal has no dessert yet. Add something sweet?",
  Starter: "🥗 Your meal has no starter yet. Add one?",
};

// Suggestions box shown on the Cart page.
// If everything in the cart is vegetarian, we suggest ONLY vegetarian dishes.
const CartSuggestions = ({ cartItems }) => {
  const dispatch = useDispatch();
  const [suggestions, setSuggestions] = useState([]);

  const course = findMissingCourse(cartItems); // "Dessert", "Starter" or null
  const allVeg = cartItems.length > 0 && cartItems.every((item) => item.isVeg);

  useEffect(() => {
    if (!course) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const list = await getMealsByCategory(course);

        // simple shuffle so the user sees different dishes each time
        const random = [...list].sort(() => Math.random() - 0.5).slice(0, 8);
        let picked = random;

        if (allVeg) {
          // download the ingredients and keep only the vegetarian ones
          const full = await Promise.all(random.map((m) => getMealById(m.idMeal)));
          picked = random.filter((m, i) => full[i] && analyzeMeal(full[i]).isVeg);
        }

        // remember the category (and diet) so the cart advisor can use it later
        const items = picked.map((m) => ({
          ...makeRestaurant(m),
          category: course,
          isVeg: allVeg ? true : undefined,
        }));

        if (!cancelled) setSuggestions(items);
      } catch (error) {
        console.log(error);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [course, allVeg]);

  // do not suggest what is already in the cart
  const idsInCart = cartItems.map((item) => item.id);
  const toShow = suggestions.filter((s) => !idsInCart.includes(s.id)).slice(0, 3);

  if (!course || toShow.length === 0) return null;

  return (
    <div className="mt-6 p-5 bg-orange-50 rounded-2xl">
      <h3 className="font-bold text-gray-800 mb-3">{messages[course]}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {toShow.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm p-3 flex flex-col">
            <img
              src={item.image + "/small"}
              alt={item.dishName}
              className="w-full h-24 object-cover rounded-lg"
            />
            <p className="font-semibold text-sm mt-2 line-clamp-2">{item.dishName}</p>
            <p className="text-xs text-gray-500">₹{item.price}</p>
            <button
              className="mt-auto pt-2 text-sm font-semibold text-orange-600 hover:text-orange-800 text-left"
              onClick={() => dispatch(additem(item))}
            >
              + Add to cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartSuggestions;
