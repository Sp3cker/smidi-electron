import { ipcMain, dialog } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc";
import type MidiManService from "../services/MidiMan/MidiMan";
import { MidiFile } from "@shared/MidiFile";
import { AppErrorPayload } from "@shared/error";
import { parseMidiToResolution } from "../services/MidiMan/MidiMan";
// Get the main window reference and MidiMan instance

export const setMidiManIpc = (midiManInstance: MidiManService) => {
  // Handle directory selection dialog
  ipcMain.handle(IPC_CHANNELS.PROMPT_MIDI_DIRECTORY, async (event) => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
    event.sender.send(IPC_CHANNELS.SET_WATCH_DIRECTORY, result.filePaths[0]);
    midiManInstance.watchDirectory = result.filePaths[0];
    midiManInstance
      .parseMidiDirectory()
      .then((midiObjects) => {
        // console.log(
        //   "Midiman: Parsed midi directory",
        //   parseMidiToResolution(midiObjects[0], 120).measures[23]
        // );
        // Convert MidiFile objects to serializable format for IPC

        const serializableData = midiObjects.map((midiFile: MidiFile) =>
          parseMidiToResolution(midiFile)
        );

        event.sender.send(IPC_CHANNELS.MIDI_MAN.MIDI_FILES, serializableData);
      })
      .catch((error) => {
        console.error("Midiman: Error parsing midi directory", error);
        event.sender.send(IPC_CHANNELS.APP_ERROR, {
          success: false,
          error: error as AppErrorPayload,
        });
      });
  });

  // Handle watch start/stop commands
  ipcMain.on(IPC_CHANNELS.START_WATCHING, (event, directory: string) => {
    console.log("IPC START_WATCHING", directory);
    if (midiManInstance && directory) {
      console.log("START_WATCHING", directory);
      // prolyl handle if this is false
      midiManInstance.watchDirectory = directory;
      midiManInstance.parseMidiDirectory().then((midiObjects) => {
        // console.log(
        //   "Midiman: Parsed midi directory",
        //   parseMidiToResolution(midiObjects[0], 120).measures[23]
        // );
        // Convert MidiFile objects to serializable format for IPC

        const serializableData = midiObjects.map((midiFile: MidiFile) =>
          parseMidiToResolution(midiFile)
        );

        midiManInstance.setWatcher(directory);

        event.sender.send(IPC_CHANNELS.MIDI_MAN.MIDI_FILES, serializableData);
      });
    } else {
      console.error("MidiMan instance not set or directory is empty");
      event.sender.send(IPC_CHANNELS.APP_ERROR, {
        success: false,
        error: "MidiMan instance not set or directory is empty",
      });
    }
  });

  ipcMain.on(IPC_CHANNELS.STOP_WATCHING, (event) => {
    if (midiManInstance) {
      midiManInstance.endWatch();
      // Notify renderer that watching has stopped
      event.sender.send(IPC_CHANNELS.WATCH_STATUS_CHANGED, false);
    }
  });
};
