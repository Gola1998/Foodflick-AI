// FEATURE: Voice search. The browser already has speech recognition built in
// (window.SpeechRecognition, or webkitSpeechRecognition in Chrome/Safari).
// No library and no AI model to download.
// Firefox does not support it, so we hide the mic button there.

import { useState } from "react";

// "Show me some pasta!" -> "pasta"
// People speak in sentences, but the search box needs only the dish word.
export const cleanVoiceText = (spoken) =>
  spoken
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/^(please )?(show me|search for|search|find me|find|look for|i want to eat|i want|i would like|get me|give me)\s+/, "")
    .replace(/^(some|a|an|the)\s+/, "")
    .replace(/\s+please$/, "")
    .trim();

// onText(text) is called with the cleaned words after the user stops speaking
const useVoiceSearch = (onText) => {
  const [listening, setListening] = useState(false);
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const start = () => {
    const recognition = new Recognition();
    recognition.lang = "en-IN"; // Indian English, it understands dish names better
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false); // mic blocked, no speech...
    recognition.onresult = (event) => {
      const text = cleanVoiceText(event.results[0][0].transcript);
      if (text) onText(text);
    };
    recognition.start();
  };

  return { supported: Boolean(Recognition), listening, start };
};

export default useVoiceSearch;
