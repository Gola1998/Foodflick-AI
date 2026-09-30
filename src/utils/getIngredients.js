// TheMealDB gives ingredients as strIngredient1 ... strIngredient20.
// This small helper collects all the filled ones into a clean array.
// Example: ["chicken breast", "plain flour", "milk"]

export const getIngredients = (meal) => {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal["strIngredient" + i];
    if (name && name.trim() !== "") {
      list.push(name.trim().toLowerCase());
    }
  }
  return list;
};
