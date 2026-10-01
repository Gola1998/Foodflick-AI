import { useState } from "react";
import { searchByPhoto } from "../utils/photoSearch";

// FEATURE: Search by food photo (stretch feature). Shown as a small 📷 button.
// The user picks a photo, the AI model in the browser compares it with the dishes of the
// selected cuisine. The result goes up through onResults, like Smart search.
// onNotice(text) shows a short message under the search bar.
const PhotoSearch = ({ restaurants, onResults, onNotice }) => {
  const [loading, setLoading] = useState(false);

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // so the same photo can be chosen again
    if (!file || restaurants.length === 0) return;

    setLoading(true);
    onNotice("📷 Comparing your photo with the dishes...");
    try {
      const items = await searchByPhoto(URL.createObjectURL(file), restaurants);
      onResults({ label: "your photo", usedAI: true, items });
      onNotice("");
    } catch (err) {
      console.log(err);
      onNotice("Photo search needs the AI model and it could not load. Please try again.");
    }
    setLoading(false);
  };

  return (
    <label
      title="Use a food photo"
      className={
        "w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-orange-50 hover:bg-orange-100 text-lg cursor-pointer transition " +
        (loading ? "opacity-50 pointer-events-none" : "")
      }
    >
      {loading ? "⏳" : "📷"}
      <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
    </label>
  );
};

export default PhotoSearch;
