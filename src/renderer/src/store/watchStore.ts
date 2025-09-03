import { create } from "zustand";
import { IPC_CHANNELS } from "../../../shared/ipc";
import {
  onMidiFiles,
  onWatchDirectorySet,
  onWatchStatusChanged,
} from "../ipcHandlers";
import { toast } from "@renderer/ui/Toast/ToastStore";
import type { ParsedMidiMeasures } from "@shared/dto";

type WatchStore = {
  directory: string;
  watching: boolean;
  midiFiles: ParsedMidiMeasures[];
  isWatching: boolean;
  setDirectory: (directory: string) => void;
  setWatching: (watching: boolean) => void;
  promptDirectory: () => void;
  startWatch: () => void;
  stopWatch: () => void;
  setMidiFiles: (midiFiles: ParsedMidiMeasures[]) => void;
};

const watchStore = create<WatchStore>((set, get) => ({
  directory: "",
  watching: false,
  setDirectory: (directory) => set(() => ({ directory })),
  setWatching: (watching) => set(() => ({ watching })),
  midiFiles: [],
  setMidiFiles: (midiFiles) => set(() => ({ midiFiles })),
  // Alias for watching state (for component convenience)
  get isWatching() {
    return get().watching;
  },
  // Selected dir is handled by `onWatchDirectorySet` below.
  promptDirectory: () => {
    window.electron.ipcRenderer.send(IPC_CHANNELS.OPEN_WATCH_DIRECTORY);
  },

  startWatch: () => {
    const directory = get().directory;
    if (directory === "") {
      toast.error("No directory set");
      return;
    }
    window.electron.ipcRenderer.send(IPC_CHANNELS.START_WATCHING, directory);
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
onMidiFiles((midiFiles) => {
  console.log("midiFiles", midiFiles);
  watchStore.getState().setMidiFiles(midiFiles);
});
export default watchStore;
