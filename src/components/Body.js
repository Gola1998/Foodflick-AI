import RestaurantCard from "./RestaurantCard";
import { useState, useEffect } from "react";
import Shimmer from "./Shimmer";
import { Link } from "react-router-dom";
import useOnlineStatus from "../utils/useOnlineStatus";
import Footer from "./Footer";
import { FOOD_API } from "../utils/constants";
import makeRestaurant from "../utils/makeRestaurant";

const cuisines = ["Italian", "Chinese", "Mexican", "Thai", "Japanese", "French", "American", "British", "Greek", "Spanish"];

const Body = () => {
  const [listOfRestaurant, setListOfRestaurant] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [cuisine, setCuisine] = useState("Italian");
  const [loading, setLoading] = useState(true);

  // runs on first load and again whenever the cuisine changes
  useEffect(() => {
    fetchData();
  }, [cuisine]);

  const fetchData = async () => {
    setLoading(true);
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
      {/* Search and Filter */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Search..."
          className="w-80 px-5 py-3 border border-gray-300 rounded-md text-base focus:ring-2 focus:ring-orange-400 focus:outline-none"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button
          className="bg-orange-500 text-white px-6 py-3 text-base rounded-md hover:bg-orange-600 transition"
          onClick={() => {
            const filteredRes = allRestaurants.filter(
              (res) =>
                res.restaurantName.toLowerCase().includes(searchText.toLowerCase()) ||
                res.dishName.toLowerCase().includes(searchText.toLowerCase())
            );
            setListOfRestaurant(filteredRes);
          }}
        >
          Search
        </button>
        <select
          className="px-4 py-3 border border-gray-300 rounded-md text-base"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
        >
          {cuisines.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          className="bg-orange-500 text-white px-6 py-3 text-sm rounded-md hover:bg-orange-600 transition"
          onClick={() => {
            const filteredList = allRestaurants.filter((res) => res.rating > 4.5);
            setListOfRestaurant(filteredList);
          }}
        >
          ⭐ Top Rated Restaurants
        </button>
      </div>

      {/* Restaurant Cards Grid */}
      {loading ? (
        <Shimmer />
      ) : listOfRestaurant.length === 0 ? (
        <p className="text-center text-gray-500 font-semibold">No restaurants found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {listOfRestaurant.map((restaurant) => (
            <Link key={restaurant.id} to={"/restaurant/" + restaurant.id}>
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
