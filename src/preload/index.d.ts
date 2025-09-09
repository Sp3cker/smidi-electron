import { ElectronAPI } from "@electron-toolkit/preload";
import { VoicegroupResponse } from "@shared/dto";
type API = {
  getVoiceGroups: () => Promise<VoicegroupResponse>;
  browseExpansionDirectory: () => Promise<void>;
};
declare global {
  interface Window {
    electron: ElectronAPI;
    api: API;
  }
}
