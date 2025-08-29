import { useStore } from "zustand";
import configStore from "./configStore";
import createSelectors from "./createSelector";
const useConfigStore = () => {
  return useStore(configStore);
};

export const useConfigStoreWithSelectors = createSelectors(configStore);
export default useConfigStore;
