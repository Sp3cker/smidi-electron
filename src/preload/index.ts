import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { IPC_CHANNELS } from "../shared/ipc";

// Custom APIs for renderer
const api = {
  getVoiceGroups: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.VOICEGROUPS.GET_VOICEGROUPS);
  },
  browseExpansionDirectory: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.CONFIG.BROWSE_EXPANSION_DIRECTORY);
  },
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
