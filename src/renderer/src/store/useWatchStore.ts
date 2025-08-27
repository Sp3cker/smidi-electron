import { useStore } from "zustand";
import watchStore from "./watchStore";

const useWatchStore = () => {
  return useStore(watchStore);
};

export default useWatchStore;