import { useState, useEffect } from "react";
import { getReviews, addReview } from "../utils/reviewStore";
import { analyzeSentiment } from "../utils/sentiment";
import { SENTIMENT_UI, summarizeReviews } from "../utils/sentimentLogic";
import useModelStatus from "../utils/useModelStatus";
import ModelProgress from "./ModelProgress";

// FEATURE: Review sentiment analysis.
// The user writes a review, the AI model in the browser reads it and adds
// a 😊 / 😐 / 😞 badge. The top shows the average for this dish.
const Reviews = ({ mealId }) => {
  const [reviews, setReviews] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const model = useModelStatus("sentiment");

  // load the saved reviews again whenever the dish changes
  useEffect(() => {
    setReviews(getReviews(mealId));
    setText("");
  }, [mealId]);

  const submit = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);

    const result = await analyzeSentiment(text.trim());
    const review = {
      text: text.trim(),
      label: result.label,
      usedAI: result.usedAI,
      date: new Date().toLocaleDateString(),
    };

    setReviews(addReview(mealId, review));
    setText("");
    setBusy(false);
  };

  const summary = summarizeReviews(reviews);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-1">💬 Reviews</h2>

      {summary && (
        <p className="text-sm font-semibold text-gray-700 mb-3">
          {SENTIMENT_UI[summary.label].emoji} Mostly {summary.label} ({summary.positiveCount} of{" "}
          {summary.count} positive)
        </p>
      )}

      <textarea
        className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-orange-400 focus:outline-none"
        rows="3"
        placeholder="How was this dish?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="mt-2 bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition disabled:opacity-50"
        onClick={submit}
        disabled={busy || !text.trim()}
      >
        {busy ? "Analyzing..." : "Post review"}
      </button>
      <p className="text-xs text-gray-400 mt-1">
        The first review downloads a small AI model (about 65 MB, once). Reviews are saved on this device only.
      </p>
      <ModelProgress model={model} what="sentiment" size="about 65 MB" />

      <ul className="mt-4 space-y-3">
        {reviews.map((review, index) => {
          const ui = SENTIMENT_UI[review.label];
          return (
            <li key={index} className="p-3 border border-gray-200 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + ui.classes}>
                  {ui.emoji} {ui.text}
                </span>
                <span className="text-xs text-gray-400">
                  {review.date} • {review.usedAI ? "AI model" : "keyword check"}
                </span>
              </div>
              <p className="text-gray-700">{review.text}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Reviews;
