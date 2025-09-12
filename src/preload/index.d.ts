import { ElectronAPI } from "@electron-toolkit/preload";
import { VoicegroupResponse } from "@shared/dto";
type API = {
  getVoiceGroups: () => Promise<VoicegroupResponse>;
  browseExpansionDirectory: () => Promise<void>;
  requestStream: (id?: string) => Promise<{ id: string; port: MessagePort }>;
};
declare global {
  interface Window {
    electron: ElectronAPI;
    api: API;

  }
}
