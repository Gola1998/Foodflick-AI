// FEATURE: Review sentiment analysis (runs the AI model in the browser)

import { getPipeline } from "./ml";
import { fromModelOutput, fallbackSentiment } from "./sentimentLogic";

// Returns { label: "positive" | "neutral" | "negative", score, usedAI }
export const analyzeSentiment = async (text) => {
  try {
    const classifier = await getPipeline("sentiment");
    const [output] = await classifier(text); // e.g. [{ label: "POSITIVE", score: 0.99 }]
    return { ...fromModelOutput(output), usedAI: true };
  } catch (error) {
    console.log("Sentiment model unavailable, using word lists instead:", error);
    return { ...fallbackSentiment(text), usedAI: false };
  }
};
