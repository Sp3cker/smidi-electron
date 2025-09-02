import { ElectronAPI } from "@electron-toolkit/preload";
type API = {
  getVoiceGroups: () => Promise<string[]>;
};
declare global {
  interface Window {
    electron: ElectronAPI;
    api: API;
  }
}
