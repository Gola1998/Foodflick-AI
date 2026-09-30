import { analyzeMeal } from "../utils/allergens";

const allergenLabels = {
  gluten: "🌾 Gluten",
  dairy: "🥛 Dairy",
  nuts: "🥜 Nuts",
  egg: "🥚 Egg",
  seafood: "🐟 Seafood",
};

// Shows Veg / Non-Veg and allergen badges for one dish.
// It needs the FULL meal (with ingredients), so we use it on the menu page.
const DietBadges = ({ meal }) => {
  const { isVeg, allergens } = analyzeMeal(meal);

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        {isVeg ? (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
            🟢 Veg
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
            🔴 Non-Veg
          </span>
        )}

        {allergens.map((name) => (
          <span
            key={name}
            className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800"
          >
            {allergenLabels[name]}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Detected automatically from the ingredients. Please double-check if you have a serious allergy.
      </p>
    </div>
  );
};

export default DietBadges;
