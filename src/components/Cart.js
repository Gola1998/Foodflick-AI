import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ItemList from "./ItemList";
import CartSuggestions from "./CartSuggestions";
import { clearCart } from "../utils/cartSlice";

const Cart = () => {
  const cartItems = useSelector((store) => store.cart.items);
  const dispatch = useDispatch();

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">🛒 Your cart</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm text-center py-16 px-4">
          <p className="text-6xl">🛒</p>
          <h2 className="text-xl font-bold text-gray-800 mt-4">Your cart is empty</h2>
          <p className="text-gray-500 mt-1">Add some dishes to get started!</p>
          <Link
            to="/"
            className="inline-block mt-6 bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-600 transition"
          >
            Browse dishes
          </Link>
        </div>
      ) : (
        // phones: one column. Big screens: items on the left (2/3), summary on the right (1/3)
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm px-5">
              <ItemList items={cartItems} />
            </div>

            {/* AI: suggests the missing course (dessert / starter) */}
            <CartSuggestions cartItems={cartItems} />
          </div>

          {/* Order summary (sticks under the header while you scroll on big screens) */}
          <div className="bg-white rounded-2xl shadow-sm p-5 lg:sticky lg:top-20">
            <h2 className="font-bold text-lg mb-4">Order summary</h2>

            <div className="flex justify-between text-gray-600">
              <span>Items</span>
              <span>{cartItems.length}</span>
            </div>
            <div className="flex justify-between text-xl font-extrabold mt-3 pt-3 border-t border-gray-100">
              <span>Total</span>
              <span className="text-orange-600">₹{total}</span>
            </div>

            <Link
              to="/payment"
              className="block text-center mt-5 bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition"
            >
              Proceed to pay ₹{total}
            </Link>
            <Link
              to="/"
              className="block text-center mt-3 border border-orange-500 text-orange-600 font-semibold py-2.5 rounded-xl hover:bg-orange-50 transition"
            >
              + Add more dishes
            </Link>
            <button
              onClick={handleClearCart}
              className="w-full mt-3 text-sm font-semibold text-red-500 hover:text-red-700"
            >
              Clear cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
