import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { askFlickBot } from "../utils/flickBot";
import { getMealById } from "../utils/mealCache";
import makeRestaurant from "../utils/makeRestaurant";
import useModelStatus from "../utils/useModelStatus";
import ModelProgress from "./ModelProgress";

const QUICK_QUESTIONS = ["Is this vegetarian?", "Any allergens?", "What is my cart total?"];

// FEATURE: FlickBot chat assistant (floating button, bottom right of every page).
// It knows two things: the dish page that is open (from the URL) and the cart (from Redux).
const FlickBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm FlickBot 🤖 Ask me about the dish you are viewing or about your cart." },
  ]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);
  const cart = useSelector((store) => store.cart.items);
  const { pathname } = useLocation();
  const model = useModelStatus("embedder");

  // keep the newest message visible
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, open]);

  const send = async (question) => {
    if (!question.trim() || busy) return;
    setMessages((old) => [...old, { from: "user", text: question }]);
    setText("");
    setBusy(true);

    // Which dish is open? On a dish page the URL looks like /restaurant/52772
    let dish = null;
    try {
      if (pathname.startsWith("/restaurant/")) {
        const meal = await getMealById(pathname.split("/")[2]);
        if (meal) dish = { restaurant: makeRestaurant(meal), meal };
      }
    } catch (error) {
      console.log(error);
    }

    const { answer, usedAI } = await askFlickBot(question, { dish, cart });
    setMessages((old) => [...old, { from: "bot", text: answer, usedAI }]);
    setBusy(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          <div className="bg-orange-500 text-white font-bold px-4 py-2 rounded-t-lg">🤖 FlickBot</div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.map((m, index) => (
              <div key={index} className={m.from === "user" ? "text-right" : "text-left"}>
                <span
                  className={
                    "inline-block px-3 py-2 rounded-lg text-left " +
                    (m.from === "user" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-800")
                  }
                >
                  {m.text}
                </span>
                {m.usedAI === false && (
                  <p className="text-xs text-gray-400 mt-1">AI model unavailable, answered with simple rules</p>
                )}
              </div>
            ))}
            {busy && <p className="text-xs text-gray-500">FlickBot is thinking...</p>}
            <ModelProgress model={model} what="chat" size="about 25 MB" />
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          <div className="flex flex-wrap gap-1 px-3 pb-2">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                disabled={busy}
                onClick={() => send(question)}
                className="text-xs px-2 py-1 rounded-full border border-gray-300 hover:border-orange-400 disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-gray-200">
            <input
              type="text"
              placeholder="Ask FlickBot..."
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(text)}
            />
            <button
              className="bg-orange-500 text-white px-3 py-2 rounded-md text-sm hover:bg-orange-600 disabled:opacity-50"
              disabled={busy || !text.trim()}
              onClick={() => send(text)}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        className="w-14 h-14 rounded-full bg-orange-500 text-white text-2xl shadow-lg hover:bg-orange-600"
        onClick={() => setOpen(!open)}
      >
        {open ? "✕" : "🤖"}
      </button>
    </div>
  );
};

export default FlickBot;
