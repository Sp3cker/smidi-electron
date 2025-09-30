import { create } from "zustand";
import { IPC_CHANNELS } from "../../../shared/ipc";
import {
  onMidiFiles,
  onWatchDirectorySet,
  onWatchStatusChanged,
  getVoicegroupDetails,
} from "../ipcHandlers";
import type { ParsedMidiMeasures, GroupVoice, Project } from "@shared/dto";

type WatchStore = {
  selectedProjectId: number | null;
  selectedProjectName: string;
  projects: string[];
  directory: string;
  watching: boolean;
  midiFiles: ParsedMidiMeasures[];

  selectedVoicegroup: string | null;
  selectedVoicegroupDetails: GroupVoice | null;
  setDirectory: (directory: string) => void;
  setWatching: (watching: boolean) => void;
  stopWatch: () => void;
  setMidiFiles: (midiFiles: ParsedMidiMeasures[]) => void;

  setSelectedVoicegroup: (voicegroup: string | null) => void;
  setSelectedProject: (project: Project) => void;
};

const watchStore = create<WatchStore>((set) => ({
  selectedProjectId: null,
  selectedProjectName: "",
  projects: [],
  directory: "",
  watching: false,
  selectedVoicegroup: null,
  selectedVoicegroupDetails: null,
  midiFiles: [],

  setDirectory: (directory) => set(() => ({ directory })),
  setWatching: (watching) => set(() => ({ watching })),
  setMidiFiles: (midiFiles) => set(() => ({ midiFiles })),

  stopWatch: () => {
    window.electron.ipcRenderer.send(IPC_CHANNELS.STOP_WATCHING);
  },

  setSelectedVoicegroup: (voicegroup) => {
    if (!voicegroup) {
      return set({ selectedVoicegroupDetails: null });
    }
    set({ selectedVoicegroup: voicegroup });
    getVoicegroupDetails(voicegroup, set);
  },
  setSelectedProject: (project) => {
    set(() => ({
      selectedProjectId: project.id,
      selectedProjectName: project.name,
      directory: project.midiPath,
    }));
  },
}));

// Set up IPC listeners
onWatchDirectorySet((directory) => {
  console.log("directory", directory);
  watchStore.getState().setDirectory(directory);
});

onWatchStatusChanged((isWatching) => {
  watchStore.getState().setWatching(isWatching);
});
onMidiFiles((midiFiles) => {
  console.log("midiFiles", midiFiles);
  watchStore.getState().setMidiFiles(midiFiles);
});

export default watchStore;
