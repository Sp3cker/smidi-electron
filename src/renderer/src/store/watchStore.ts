import { create } from "zustand";
type WatchStore = {
  directory: string;
  watching: boolean;
  setDirectory: (directory: string) => void;
  setWatching: (watching: boolean) => void;
};
const watchStore = create<WatchStore>((set) => ({
  directory: "",
  watching: false,
  setDirectory: (directory) => set(() => ({ directory })),
  setWatching: (watching) => set(() => ({ watching })),
}));
export default watchStore;
