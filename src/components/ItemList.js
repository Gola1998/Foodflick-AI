import { useDispatch } from "react-redux";
import { removeItem } from "../utils/cartSlice";

// Used inside the Cart page to show every item that was added
const ItemList = ({ items }) => {
  const dispatch = useDispatch();

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={`${item.id}-${index}`} // combine id with index so duplicates get a unique key
          className="flex flex-col md:flex-row justify-between gap-4 py-4 border-b border-gray-200"
        >
          {/* Left Info */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{item.dishName}</h3>
            <p className="text-gray-600 text-sm mt-1">{item.restaurantName}</p>
            <p className="text-md font-medium mt-2">₹{item.price}</p>
          </div>

          {/* Right Image + Button */}
          <div className="relative md:w-40 w-full">
            <img
              src={item.image + "/small"}
              alt={item.dishName}
              className="rounded-lg w-full h-24 object-cover"
            />
            <button
              className="absolute bottom-2 right-2 bg-white border border-gray-300 px-3 py-1 rounded text-sm shadow-md hover:bg-gray-50"
              onClick={() => dispatch(removeItem(index))}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItemList;
