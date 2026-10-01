import RestaurantCard from "./RestaurantCard";
import { useState, useEffect } from "react";
import Shimmer from "./Shimmer";
import { Link } from "react-router-dom";
import useOnlineStatus from "../utils/useOnlineStatus";
import Footer from "./Footer";
import { FOOD_API } from "../utils/constants";
import makeRestaurant from "../utils/makeRestaurant";
import SearchHero from "./SearchHero";
import ForYou from "./ForYou";
import useSmartSearch from "../utils/useSmartSearch";

const cuisines = ["Italian", "Chinese", "Mexican", "Thai", "Japanese", "French", "American", "British", "Greek", "Spanish"];
const cuisineEmoji = {
  Italian: "🍝", Chinese: "🥡", Mexican: "🌮", Thai: "🍜", Japanese: "🍣",
  French: "🥐", American: "🍔", British: "🫖", Greek: "🥙", Spanish: "🥘",
};

const Body = () => {
  const [listOfRestaurant, setListOfRestaurant] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [cuisine, setCuisine] = useState("Italian");
  const [loading, setLoading] = useState(true);
  // AI: result of Smart search / mood chips / photo. null = show the normal list.
  const [smart, setSmart] = useState(null);
  const ai = useSmartSearch(allRestaurants, setSmart); // the Smart search logic

  // go back to the normal list
  const resetSmart = () => {
    setSmart(null);
    ai.reset();
  };

  // runs on first load and again whenever the cuisine changes
  useEffect(() => {
    fetchData();
  }, [cuisine]);

  const fetchData = async () => {
    setLoading(true);
    resetSmart(); // the old AI results belonged to the old cuisine
    try {
      const data = await fetch(FOOD_API + "/filter.php?a=" + cuisine);
      const json = await data.json();

      // json.meals is null when nothing is found, so we use [] instead
      const restaurants = (json.meals || []).map(makeRestaurant);

      setListOfRestaurant(restaurants);
      setAllRestaurants(restaurants);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  // the normal search: keep the dishes whose name contains the text
  const searchDishes = (text) => {
    resetSmart();
    const filteredRes = allRestaurants.filter(
      (res) =>
        res.restaurantName.toLowerCase().includes(text.toLowerCase()) ||
        res.dishName.toLowerCase().includes(text.toLowerCase())
    );
    setListOfRestaurant(filteredRes);
  };

  const onlineStatus = useOnlineStatus();
  if (!onlineStatus) {
    return (
      <h1 className="text-center text-red-500 font-semibold text-xl py-6">
        Looks like you're offline! Please check your internet connection.
      </h1>
    );
  }

  return (
    <div className="px-4 py-6 max-w-screen-xl mx-auto">
      {/* One search bar: name, feeling (AI), voice, photo and mood chips */}
      <SearchHero
        searchText={searchText}
        setSearchText={setSearchText}
        onNameSearch={searchDishes}
        restaurants={allRestaurants}
        ai={ai}
        onResults={setSmart}
      />

      {/* AI: picks learned from what the user viewed and added to the cart */}
      {!smart && <ForYou />}

      {/* Cuisine pills (they scroll sideways on small screens) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
        {cuisines.map((c) => (
          <button
            key={c}
            onClick={() => setCuisine(c)}
            className={
              "shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition " +
              (cuisine === c
                ? "bg-orange-500 text-white border-orange-500 shadow"
                : "bg-white text-gray-700 border-gray-200 hover:border-orange-400")
            }
          >
            {cuisineEmoji[c]} {c}
          </button>
        ))}
      </div>

      {/* AI: explains what the results are */}
      {smart && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-gray-700">
          <p className="text-sm">
            🧠 Best {cuisine} matches for <b>{smart.label}</b>
            {!smart.usedAI && " (AI model unavailable, matched by keywords)"}
          </p>
          <button className="text-sm font-semibold text-orange-600" onClick={resetSmart}>
            ✕ Clear
          </button>
        </div>
      )}

      {/* Heading + Top Rated filter */}
      {!smart && !loading && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">🍽️ {cuisine} dishes</h2>
          <button
            className="px-4 py-1.5 rounded-full text-sm font-semibold border border-yellow-400 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition"
            onClick={() => {
              resetSmart();
              const filteredList = allRestaurants.filter((res) => res.rating > 4.5);
              setListOfRestaurant(filteredList);
            }}
          >
            ⭐ Top Rated
          </button>
        </div>
      )}

      {/* Restaurant Cards Grid */}
      {loading ? (
        <Shimmer />
      ) : (smart ? smart.items.length : listOfRestaurant.length) === 0 ? (
        <p className="text-center text-gray-500 font-semibold">
          {smart ? "No dishes matched. Try different words or a mood chip." : "No restaurants found."}
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {(smart
            ? smart.items
            : listOfRestaurant.map((restaurant) => ({ restaurant, score: null }))
          ).map(({ restaurant, score }) => (
            <Link key={restaurant.id} to={"/restaurant/" + restaurant.id} className="relative block">
              {score !== null && (
                <span className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {Math.round(score * 100)}% match
                </span>
              )}
              <RestaurantCard resData={restaurant} />
            </Link>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Body;
