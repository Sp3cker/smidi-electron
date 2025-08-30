import { IPC_CHANNELS } from "../../../shared/ipc";
import { create } from "zustand";
import { toast } from "@renderer/ui/Toast/ToastStore";
type ConfigStore = {
  config: Record<string, string> | null;
  configDrawerOpen: boolean;
  isLoading: boolean; // Set by listener. No reason to have setter
  getConfig: () => void;
  updateConfig: (key: string, value: string | number) => void;
  setConfigDrawerOpen: (open: boolean) => void;
  updateExpansionDir: (value: string) => void;
};

const configStore = create<ConfigStore>((set, get) => ({
  config: null,
  isLoading: true,
  configDrawerOpen: false,
  getConfig: () => {
    window.electron.ipcRenderer.send(IPC_CHANNELS.CONFIG.GET_CONFIG);
  },
  updateExpansionDir: (value: string) => {
    window.electron.ipcRenderer.send(
      IPC_CHANNELS.CONFIG.UPDATE_EXPANSION_DIR,
      value
    );
  },
  updateConfig: (key, value) => {
    const currentConfig = get().config;
    const newConfig = { ...currentConfig, [key]: value };
    console.log("Renderer: update config", newConfig);
    // Send to main process
    window.electron.ipcRenderer.send(
      IPC_CHANNELS.CONFIG.UPDATE_CONFIG,
      newConfig
    );
  },
  setConfigDrawerOpen: (open: boolean) => set({ configDrawerOpen: open }),
}));

// Set up IPC listener to receive config updates from main process
window.electron.ipcRenderer.on(
  IPC_CHANNELS.CONFIG.CONFIG_UPDATED,
  (_, newConfig) => {
    console.log("config loaded", newConfig);
    toast.info("Config updated successfully");
    configStore.setState({
      config: newConfig.data,
      isLoading: false,
    });
  }
);

export default configStore;
