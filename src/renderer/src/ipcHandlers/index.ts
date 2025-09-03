import { IPC_CHANNELS } from "../../../shared/ipc";
import type { ParsedMidiMeasures } from "@shared/dto";
/** Mostly for *listening* for events from the server. */
const createIPCListener = <T>(
  channel: string,
  callback: (event: Electron.IpcRendererEvent, data: T) => void
) => {
  return window.electron.ipcRenderer.on(channel, callback);
};

// Hooked up to WatchStore
export const onWatchDirectorySet = (callback: (directory: string) => void) => {
  return createIPCListener(
    IPC_CHANNELS.SET_WATCH_DIRECTORY,
    (_, directory: string) => {
      callback(directory);
    }
  );
};

// Hooked up to WatchStore
export const onWatchStatusChanged = (
  callback: (isWatching: boolean) => void
) => {
  return createIPCListener(
    IPC_CHANNELS.WATCH_STATUS_CHANGED,
    (_, isWatching: boolean) => {
      callback(isWatching);
    }
  );
};

export const onMidiFiles = (
  callback: (midiFiles: ParsedMidiMeasures[]) => void
) => {
  return createIPCListener(
    IPC_CHANNELS.MIDI_MAN.MIDI_FILES,
    (_, midiFileData: any[]) => {
      // Convert serialized data back to MidiFile objects

      callback(midiFileData as ParsedMidiMeasures[]);
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
