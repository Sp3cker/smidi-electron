import { IPC_CHANNELS } from "../../../shared/ipc";
import { ConfigResponse } from "../../../shared/dto";
import { create } from "zustand";
import { toast } from "@renderer/ui/Toast/ToastStore";
type AppConfig = {
  expansionDir: string;
};
type ConfigStore = {
  config: AppConfig | null;
  configDrawerOpen: boolean;
  isLoading: boolean; // Set by listener. No reason to have setter
  validConfig: boolean;
  consoleOpen: boolean;
  getConfig: () => void;
  updateConfig: (key: string, value: string | number) => void;
  setConfigDrawerOpen: (open: boolean) => void;
  updateExpansionDir: (value: string) => void;
  resetConfig: () => void;
  setConsoleOpen: (open: boolean) => void;
};

const configStore = create<ConfigStore>((set, get) => ({
  config: null,
  validConfig: false,
  isLoading: true,
  configDrawerOpen: false,
  consoleOpen: false,
  getConfig: () => {
    window.electron.ipcRenderer.send(IPC_CHANNELS.CONFIG.GET_CONFIG);
  },
  setConsoleOpen: (open: boolean) => set({ consoleOpen: open }),
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
  resetConfig: () => {
    window.electron.ipcRenderer.send(IPC_CHANNELS.CONFIG.RESET_CONFIG);
  },
}));

// Set up IPC listener to receive config updates from main process
window.electron.ipcRenderer.on(
  IPC_CHANNELS.CONFIG.CONFIG_UPDATED,
  (_, newConfig: ConfigResponse) => {
    if (!newConfig.success) {
      toast.error(
        `Error loading config: ${newConfig.error.message} (code: ${newConfig.error.code})`
      );
      configStore.setState({ isLoading: false });
      return;
    }
    console.log("config loaded", newConfig);
    toast.info("Config updated successfully");

    configStore.setState({
      config: { expansionDir: newConfig.data.expansionDir },
      validConfig: newConfig.data.isValid,
      isLoading: false,
    });
  }
);
window.electron.ipcRenderer.on(IPC_CHANNELS.CONFIG.CONFIG_WAS_RESET, () => {
  toast.info("Config reset successfully");
});
export default configStore;
