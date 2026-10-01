import { useState } from "react";
import { Link } from "react-router-dom";
import useOnlineStatus from "../utils/useOnlineStatus";
import { useSelector } from "react-redux";

// LOGIN (turned off for now, will be added later with Firebase Auth).
// To turn it back on: remove the comment marks from every "LOGIN" part in this file.
// import { useContext } from "react";                 // also add useContext to the react import
// import UserContext from "./UserContext";

// One list for the links, so the desktop bar and the mobile menu use the same data
const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/planner", label: "✨ Meal Planner" },
];

const linkStyle = "px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition";
// LOGIN
// const loginStyle = "px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition";

export const Header = () => {
  // LOGIN
  // const [btnNameReact, setBtnNameReact] = useState("Login");
  const [menuOpen, setMenuOpen] = useState(false); // the ☰ menu on small screens
  const onlineStatus = useOnlineStatus();

  // LOGIN
  // const {loggedInUser} = useContext(UserContext);

  // Subscribing to the store using a Selector
  const cartItems = useSelector((store) => store.cart.items);

  // LOGIN
  // const toggleLogin = () => setBtnNameReact(btnNameReact === "Login" ? "Logout" : "Login");

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold text-orange-500">
          🍔 Food<span className="text-gray-800">Flick</span>
        </Link>

        {/* Links: only on medium and bigger screens */}
        <nav className="hidden md:flex items-center gap-1 font-medium text-gray-700">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={linkStyle}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Cart with the number of items */}
          <Link
            to="/cart"
            className="px-3 py-2 rounded-full bg-orange-50 text-orange-600 font-semibold hover:bg-orange-100 transition"
          >
            🛒 Cart
            <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
              {cartItems.length}
            </span>
          </Link>

          {/* LOGIN button (turned off for now)
          <button className={"hidden sm:block " + loginStyle} onClick={toggleLogin}>
            {btnNameReact}
          </button>
          */}

          {/* Online Status */}
          <span className="text-sm select-none" title={onlineStatus ? "Online" : "Offline"}>
            {onlineStatus ? "🟢" : "🔴"}
          </span>

          {/* ☰ button: only on small screens */}
          <button className="md:hidden text-2xl px-1" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* The menu that opens on small screens */}
      {menuOpen && (
        <nav className="md:hidden border-t border-gray-100 px-4 py-2 flex flex-col font-medium text-gray-700">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={linkStyle} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          {/* LOGIN button for the small screen menu (turned off for now)
          <button className={"sm:hidden mt-2 mb-1 " + loginStyle} onClick={toggleLogin}>
            {btnNameReact}
          </button>
          */}
        </nav>
      )}
    </header>
  );
};

export default Header;
