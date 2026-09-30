import { useSyncExternalStore } from "react";
import { subscribeToStatus, getStatus } from "./ml";

// A small hook so a component can show the download progress of a model.
// Usage: const { state, percent } = useModelStatus("embedder");
// useSyncExternalStore is React's official way to read data that lives outside React.
const useModelStatus = (key) =>
  useSyncExternalStore(subscribeToStatus, () => getStatus(key));

export default useModelStatus;
