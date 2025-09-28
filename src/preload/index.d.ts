import { ElectronAPI } from "@electron-toolkit/preload";
import { VoicegroupResponse, Project } from "@shared/dto";
type API = {
  getVoiceGroups: () => Promise<VoicegroupResponse>;
  getProjects: () => Promise<
    { success: true; data: Project[] } | { success: false; error: string }
  >;
  browseExpansionDirectory: () => Promise<void>;
  /**
   * Creates a new project.
   * @param name The name of the project.
   * @param midiPath The MIDI path for the project.
   * @returns The ID of the created project.
   */
  createProject: (
    name: string,
    midiPath: string
  ) => Promise<{ success: boolean; data?: number; error?: string }>;
  requestStream: (id?: string) => Promise<{ id: string; port: MessagePort }>;
  promptMidiDirectory: () => Promise<string | null>;
};
declare global {
  interface Window {
    electron: ElectronAPI;
    api: API;
  }
}
