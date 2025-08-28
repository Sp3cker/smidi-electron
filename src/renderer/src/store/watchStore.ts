import { create } from "zustand";
import { IPC_CHANNELS } from "../../../shared/ipc";
import {
  onMidiFilesList,
  onWatchDirectorySet,
  onWatchStatusChanged,
} from "../ipcHandlers";

type WatchStore = {
  directory: string;
  watching: boolean;
  midiFileNames: string[];
  isWatching: boolean;
  setDirectory: (directory: string) => void;
  setWatching: (watching: boolean) => void;
  promptDirectory: () => void;
  startWatch: () => void;
  stopWatch: () => void;
  setMidiFileNames: (midiFileNames: string[]) => void;
};

const watchStore = create<WatchStore>((set, get) => ({
  directory: "",
  watching: false,
  setDirectory: (directory) => set(() => ({ directory })),
  setWatching: (watching) => set(() => ({ watching })),
  midiFileNames: [],
  setMidiFileNames: (midiFileNames) => set(() => ({ midiFileNames })),
  // Alias for watching state (for component convenience)
  get isWatching() {
    return get().watching;
  },
  // Selected dir is handled by `onWatchDirectorySet` below.
  promptDirectory: () => {
    window.electron.ipcRenderer.send(IPC_CHANNELS.OPEN_WATCH_DIRECTORY);
  },

  startWatch: () => {
    window.electron.ipcRenderer.send(
      IPC_CHANNELS.START_WATCHING,
      get().directory
    );
  },

  stopWatch: () => {
    window.electron.ipcRenderer.send(IPC_CHANNELS.STOP_WATCHING);
  },
}));

// Set up IPC listeners
onWatchDirectorySet((directory) => {
  console.log("directory", directory);
  watchStore.getState().setDirectory(directory);
});

onWatchStatusChanged((isWatching) => {
  watchStore.getState().setWatching(isWatching);
});
onMidiFilesList((midiFileNames) => {
  console.log("midiFileNames", midiFileNames);
  watchStore.getState().setMidiFileNames(midiFileNames);
});
export default watchStore;
