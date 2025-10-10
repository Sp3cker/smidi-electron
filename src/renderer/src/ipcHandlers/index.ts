import { toast } from "@renderer/ui";
import { IPC_CHANNELS } from "../../../shared/ipc";
import type { GroupVoice, ParsedMidiTrack } from "@shared/dto";
/** Mostly for *listening* for events from the server. */
const createIPCListener = <T>(
  channel: string,
  callback: (event: Electron.IpcRendererEvent, data: T) => void
) => {
  return window.electron.ipcRenderer.on(channel, callback);
};

export const onMidiFiles = (callback: (midiFiles: ParsedMidiTrack[]) => void) => {
  return createIPCListener(
    IPC_CHANNELS.MIDI_MAN.MIDI_FILES,
    (_, midiFileData: any[]) => {
      // Convert serialized data back to MidiFile objects

      callback(midiFileData as ParsedMidiTrack[]);
    }
  );
};

export const onFileChanged = (callback: (filePath: string) => void) => {
  return createIPCListener(IPC_CHANNELS.FILE_CHANGED, (_, filePath: string) => {
    callback(filePath);
  });
};

export const onConfigLoaded = (
  callback: (config: Record<string, string>) => void
) => {
  return createIPCListener(
    IPC_CHANNELS.CONFIG.CONFIG_UPDATED,
    (_, config: Record<string, string>) => {
      callback(config);
    }
  );
};
export const getVoicegroupDetails = (
  voicegroupName: string,
  set: (state: { selectedVoicegroupDetails: GroupVoice }) => void
): Promise<void> => {
  console.time("getVoicegroupDetails");
  window.electron.ipcRenderer
    .invoke(IPC_CHANNELS.VOICEGROUPS.GET_VOICEGROUP_DETAILS, voicegroupName)
    .then((vg) => {
      console.log("vg", vg);
      set({ selectedVoicegroupDetails: JSON.parse(vg.data) });
    })
    .catch((err) =>
      toast.error("Error getting voicegroup details: " + err.message)
    );
};
