import { IPC_CHANNELS } from "../../../shared/ipc";
import { create } from "zustand";

type ConfigStore = {
  config: Record<string, string> | null;
  getConfig: () => void;
  isLoading: boolean;
  updateConfig: (key: string, value: string) => void;
};

const configStore = create<ConfigStore>((set, get) => ({
  config: null,
  isLoading: true,
  getConfig: () => {
    window.electron.ipcRenderer.send(IPC_CHANNELS.GET_CONFIG);
  },
  updateConfig: (key, value) => {
    const currentConfig = get().config;
    const newConfig = { ...currentConfig, [key]: value };

    // Send to main process
    window.electron.ipcRenderer.send(IPC_CHANNELS.UPDATE_CONFIG, newConfig);
  },
}));

// Set up IPC listener to receive config updates from main process
window.electron.ipcRenderer.on(IPC_CHANNELS.CONFIG_LOAD, (event, config) => {
  console.log("config loaded", config);
  configStore.setState({ config, isLoading: false });
});

export default configStore;
