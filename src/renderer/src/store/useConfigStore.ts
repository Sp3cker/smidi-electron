import { useStore } from "zustand";
import configStore from "./configStore";

const useConfigStore = () => {
  return useStore(configStore);
};

export default useConfigStore;
