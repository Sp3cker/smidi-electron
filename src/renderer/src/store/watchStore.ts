import { create } from "zustand";
import { IPC_CHANNELS } from "../../../shared/ipc";
import { onMidiFiles, getVoicegroupDetails } from "../ipcHandlers";
import type { ParsedMidiTrack, GroupVoice, Project } from "@shared/dto";

type WatchStore = {
  selectedProjectId: number | null;
  selectedProjectName: string;
  projects: string[];

  midiFiles: ParsedMidiTrack[];

  selectedVoicegroup: string | null;
  selectedVoicegroupDetails: GroupVoice | null;

  setMidiFiles: (midiFiles: ParsedMidiTrack[]) => void;

  setSelectedVoicegroup: (voicegroup: string | null) => void;
  setSelectedProject: (project: Project) => void;
};

const watchStore = create<WatchStore>((set) => ({
  selectedProjectId: null,
  selectedProjectName: "",
  projects: [],

  selectedVoicegroup: null,
  selectedVoicegroupDetails: null,
  midiFiles: [],

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

onMidiFiles((midiFiles) => {
  console.log("midiFiles", midiFiles);
  watchStore.getState().setMidiFiles(midiFiles);
});

export default watchStore;
