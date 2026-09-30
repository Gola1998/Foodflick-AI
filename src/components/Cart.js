import { useDispatch, useSelector } from "react-redux";
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
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">🛒 Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2">Add some items to get started!</p>
        </div>
      ) : (
        <>
          <ItemList items={cartItems} />

          <div className="flex justify-between items-center mt-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Total ({cartItems.length} items): <span className="font-bold">₹{total}</span>
            </h2>

            <button
              onClick={handleClearCart}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              Clear Cart
            </button>
          </div>

          {/* AI: suggests the missing course (dessert / starter) */}
          <CartSuggestions cartItems={cartItems} />
        </>
      )}
    </div>
  );
};

export default Cart;
