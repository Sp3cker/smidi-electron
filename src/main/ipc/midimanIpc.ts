import { ipcMain, dialog, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc";
import type MidiMan from "../MidiMan/MidiMan";
import { MidiFile } from "@shared/MidiFile";
import { AppErrorPayload } from "@shared/error";
import { parseMidiToResolution } from "../MidiMan/MidiMan";
// Get the main window reference and MidiMan instance
let mainWindow: BrowserWindow;

export const setMainWindow = (window: BrowserWindow) => {
  mainWindow = window;
};

export const setMidiManIpc = (midiManInstance: MidiMan) => {
  // Handle directory selection dialog
  ipcMain.on(IPC_CHANNELS.OPEN_WATCH_DIRECTORY, async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });

    if (!result.canceled && result.filePaths.length > 0) {
      mainWindow.webContents.send(
        IPC_CHANNELS.SET_WATCH_DIRECTORY,
        result.filePaths[0]
      );
      midiManInstance.watchDirectory = result.filePaths[0];
      midiManInstance
        .parseMidiDirectory()
        .then((midiObjects) => {
          console.log(
            "Midiman: Parsed midi directory",
            parseMidiToResolution(midiObjects[0], 120).measures[23]
          );
          // Convert MidiFile objects to serializable format for IPC

          const serializableData = midiObjects.map((midiFile: MidiFile) =>
            midiFile.toSerializable()
          );

          mainWindow.webContents.send(
            IPC_CHANNELS.MIDI_MAN.MIDI_FILES,
            serializableData
          );
        })
        .catch((error) => {
          console.error("Midiman: Error parsing midi directory", error);
          mainWindow.webContents.send(IPC_CHANNELS.APP_ERROR, {
            success: false,
            error: error as AppErrorPayload,
          });
        });
    }
  });

  // Handle watch start/stop commands
  ipcMain.on(IPC_CHANNELS.START_WATCHING, (_, directory: string) => {
    if (midiManInstance && directory) {
      console.log("START_WATCHING", directory);
      // prolyl handle if this is false

      midiManInstance.setWatcher(directory);

      mainWindow.webContents.send(IPC_CHANNELS.WATCH_STATUS_CHANGED, true);
    } else {
      console.error("MidiMan instance not set or directory is empty");
      mainWindow.webContents.send(IPC_CHANNELS.APP_ERROR, {
        success: false,
        error: "MidiMan instance not set or directory is empty",
      });
    }
  });

  ipcMain.on(IPC_CHANNELS.STOP_WATCHING, () => {
    if (midiManInstance) {
      midiManInstance.endWatch();
      // Notify renderer that watching has stopped
      mainWindow.webContents.send(IPC_CHANNELS.WATCH_STATUS_CHANGED, false);
    }
  });
};
