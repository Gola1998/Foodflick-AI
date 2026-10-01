const RestaurantCard = ({ resData }) => {
  const { restaurantName, dishName, image, rating, deliveryTime, price } = resData;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-200 w-full h-full flex flex-col overflow-hidden">
      {/* Dish Image (/medium gives a smaller image so the page loads faster) */}
      <div className="relative">
        <img className="w-full h-40 object-cover" alt={dishName} src={image + "/medium"} />
        <span className="absolute bottom-2 left-2 bg-white/90 text-gray-800 text-xs font-bold px-2 py-1 rounded-full">
          ⭐ {rating}
        </span>
      </div>

      {/* Restaurant Info */}
      <div className="flex flex-col flex-grow p-4">
        <h3 className="font-bold text-gray-800 truncate">{restaurantName}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{dishName}</p>

        <div className="mt-auto pt-3 flex items-center justify-between text-sm">
          <span className="font-bold text-orange-600">₹{price}</span>
          <span className="text-gray-500">🕒 {deliveryTime} min</span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
