import { ElectronAPI } from "@electron-toolkit/preload";
import {
  VoicegroupResponse,
  Project,
  ParsedMidiTrack,
} from "@shared/dto";
type ApiResult<T> = { success: true; data: T } | { success: false; error: string };
type API = {
  getVoiceGroups: () => Promise<VoicegroupResponse>;
  getProjects: () => Promise<ApiResult<Project[]>>;
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
  ) => Promise<
    ApiResult<{ project: Project; midiFiles: ParsedMidiTrack[] }>
  >;
  openProject: (
    projectId: number
  ) => Promise<
    ApiResult<{ project: Project; midiFiles: ParsedMidiTrack[] }>
  >;
  requestStream: (id?: string) => Promise<{ id: string; port: MessagePort }>;
  promptMidiDirectory: () => Promise<
    ApiResult<{ directory: string }>
  >;
};
declare global {
  interface Window {
    electron: ElectronAPI;
    api: API;
  }
}
