// FEATURE: Mood-based ordering (zero-shot matching)
//
// "Zero-shot" means: we never trained a model on moods. Instead we describe
// each mood in one normal sentence, turn that sentence into an embedding, and
// show the dishes whose embedding is closest. The model already understands
// English well enough to connect "tired" with "light, warm, comforting".

export const MOODS = [
  {
    id: "tired",
    label: "😴 Tired",
    query: "light, warm, simple and comforting food that is easy to eat when you are tired",
  },
  {
    id: "celebrating",
    label: "🎉 Celebrating",
    query: "special, rich, indulgent and festive food for celebrating with friends",
  },
  {
    id: "sick",
    label: "🤒 Feeling sick",
    query: "mild, soft, warm soup or rice food that is gentle on the stomach when you are sick",
  },
  {
    id: "workout",
    label: "💪 After workout",
    query: "high protein healthy food with chicken, fish, eggs or beans to recover after exercise",
  },
  {
    id: "comfort",
    label: "🥺 Need comfort",
    query: "cheesy, creamy, baked, hearty comfort food that feels like home",
  },
  {
    id: "spicy",
    label: "🌶️ Feeling bold",
    query: "spicy, fiery, strongly flavoured food with chilli and lots of spices",
  },
];
