import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { clearCart } from "../utils/cartSlice";

// DEMO payment page. No real money moves and nothing is sent anywhere:
// we only wait 1.5 seconds, clear the cart and show a "success" screen.
const methods = [
  { id: "upi", label: "📱 UPI" },
  { id: "card", label: "💳 Card" },
  { id: "cod", label: "💵 Cash on delivery" },
];

const inputStyle =
  "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none";

const Payment = () => {
  const cartItems = useSelector((store) => store.cart.items);
  const dispatch = useDispatch();

  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState(null); // filled after "payment" succeeds

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  // The Pay button stays disabled until the chosen method has valid looking data
  const canPay =
    (method === "upi" && upiId.includes("@")) ||
    (method === "card" && cardNumber.replace(/\s/g, "").length === 16 && expiry.length === 5 && cvv.length === 3) ||
    method === "cod";

  const handlePay = () => {
    setProcessing(true);

    setTimeout(() => {
      // we save the order details BEFORE clearing the cart, because clearing removes the items
      setOrder({
        id: "FF" + Math.floor(100000 + Math.random() * 900000),
        total: total,
        count: cartItems.length,
        method: methods.find((m) => m.id === method).label,
        minutes: Math.max(...cartItems.map((item) => item.deliveryTime)),
      });
      dispatch(clearCart());
      setProcessing(false);
    }, 1500);
  };

  // 1. Success screen
  if (order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-sm text-center p-8">
          <p className="text-6xl">✅</p>
          <h1 className="text-2xl font-extrabold text-gray-800 mt-4">Order placed!</h1>
          <p className="text-gray-500 mt-1">Your food will arrive in about {order.minutes} minutes.</p>

          <div className="text-left mt-6 space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Order ID</span>
              <b>{order.id}</b>
            </div>
            <div className="flex justify-between">
              <span>Items</span>
              <b>{order.count}</b>
            </div>
            <div className="flex justify-between">
              <span>Paid with</span>
              <b>{order.method}</b>
            </div>
            <div className="flex justify-between text-lg pt-3 border-t border-gray-100">
              <span>Total</span>
              <b className="text-orange-600">₹{order.total}</b>
            </div>
          </div>

          <Link
            to="/"
            className="inline-block mt-8 bg-orange-500 text-white font-semibold px-8 py-3 rounded-xl hover:bg-orange-600 transition"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // 2. Nothing to pay for
  if (cartItems.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-3xl shadow-sm p-8">
          <p className="text-5xl">🛒</p>
          <h1 className="text-xl font-bold mt-4">Your cart is empty</h1>
          <p className="text-gray-500 mt-1">Add some dishes before you pay.</p>
          <Link
            to="/"
            className="inline-block mt-6 bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-600 transition"
          >
            Browse dishes
          </Link>
        </div>
      </div>
    );
  }

  // 3. The payment form
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/cart" className="inline-block mb-4 text-sm font-semibold text-orange-600 hover:text-orange-800">
        ← Back to cart
      </Link>
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">💳 Payment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: choose how to pay */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5 md:p-6">
          <h2 className="font-bold text-lg mb-4">Choose a payment method</h2>

          <div className="grid grid-cols-3 gap-2">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={
                  "py-3 px-2 rounded-xl border text-sm font-semibold transition " +
                  (method === m.id
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-700 border-gray-200 hover:border-orange-400")
                }
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {method === "upi" && (
              <>
                <label className="text-sm font-semibold text-gray-700">UPI ID</label>
                <input
                  type="text"
                  placeholder="name@upi"
                  className={inputStyle}
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </>
            )}

            {method === "card" && (
              <>
                <label className="text-sm font-semibold text-gray-700">Card number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  placeholder="4242 4242 4242 4242"
                  className={inputStyle}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/[^\d ]/g, ""))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Expiry</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      className={inputStyle}
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">CVV</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={3}
                      placeholder="123"
                      className={inputStyle}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </div>
              </>
            )}

            {method === "cod" && (
              <p className="text-gray-600 bg-gray-50 rounded-xl p-4">
                💵 Pay in cash when your order arrives. Please keep the exact amount ready.
              </p>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-6">
            🧪 This is a demo page. No real payment is made, so please do not enter real card details.
          </p>
        </div>

        {/* Right: what you are paying for */}
        <div className="bg-white rounded-2xl shadow-sm p-5 lg:sticky lg:top-20">
          <h2 className="font-bold text-lg mb-4">Your order</h2>

          <ul className="space-y-2 text-sm text-gray-600">
            {cartItems.map((item, index) => (
              <li key={`${item.id}-${index}`} className="flex justify-between gap-3">
                <span className="truncate">{item.dishName}</span>
                <span className="shrink-0">₹{item.price}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between text-xl font-extrabold mt-4 pt-4 border-t border-gray-100">
            <span>Total</span>
            <span className="text-orange-600">₹{total}</span>
          </div>

          <button
            className="w-full mt-5 bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition disabled:opacity-50"
            disabled={!canPay || processing}
            onClick={handlePay}
          >
            {processing ? "Processing..." : method === "cod" ? "Place order" : "Pay ₹" + total}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
