import { useEffect, useState } from "react";
import { FOOD_API } from "./constants";

const useRestaurantMenu = (resId) => {
  const [resInfo, setResInfo] = useState(null);

  useEffect(() => {
    fetchData();
  }, [resId]);

  const fetchData = async () => {
    const data = await fetch(FOOD_API + "/lookup.php?i=" + resId);
    const json = await data.json();
    setResInfo(json.meals[0]);
  };

  return resInfo;
};

export default useRestaurantMenu;
