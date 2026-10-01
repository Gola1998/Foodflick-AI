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
          className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0"
        >
          {/* Image */}
          <img
            src={item.image + "/small"}
            alt={item.dishName}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0"
          />

          {/* Info + Remove (min-w-0 lets a long name be cut with ...) */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">{item.dishName}</h3>
            <p className="text-sm text-gray-500 truncate">{item.restaurantName}</p>
            <button
              className="mt-1 text-sm font-semibold text-red-500 hover:text-red-700"
              onClick={() => dispatch(removeItem(index))}
            >
              Remove
            </button>
          </div>

          {/* Price */}
          <p className="font-bold text-gray-800">₹{item.price}</p>
        </div>
      ))}
    </div>
  );
};

export default ItemList;
