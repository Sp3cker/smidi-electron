import { create } from "zustand";
import { IPC_CHANNELS } from '../../../shared/ipc';
import { onWatchDirectorySet, onWatchStatusChanged } from '../ipcHandlers/listenToState';

type WatchStore = {
  directory: string;
  watching: boolean;
  setDirectory: (directory: string) => void;
  setWatching: (watching: boolean) => void;
  promptDirectory: () => void;
  startWatch: () => void;
  stopWatch: () => void;
  isWatching: boolean;
};

const watchStore = create<WatchStore>((set, get) => ({
  directory: "",
  watching: false,
  setDirectory: (directory) => set(() => ({ directory })),
  setWatching: (watching) => set(() => ({ watching })),

  // Alias for watching state (for component convenience)
  get isWatching() {
    return get().watching;
  },

  promptDirectory: () => {
    window.electron.ipcRenderer.send(IPC_CHANNELS.OPEN_WATCH_DIRECTORY);
  },

  startWatch: () => {
    window.electron.ipcRenderer.send(IPC_CHANNELS.START_WATCHING, get().directory);
    set(() => ({ watching: true }));
  },

  stopWatch: () => {
    window.electron.ipcRenderer.send(IPC_CHANNELS.STOP_WATCHING);
    set(() => ({ watching: false }));
  },
}));

// Set up IPC listeners
onWatchDirectorySet((directory) => {
  watchStore.getState().setDirectory(directory);
});

onWatchStatusChanged((isWatching) => {
  watchStore.getState().setWatching(isWatching);
});

export default watchStore;
