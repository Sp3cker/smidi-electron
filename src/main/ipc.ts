import { ipcMain, dialog, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../shared/ipc";
import MidiMan from "./MidiMan/MidiMan";

// Get the main window reference and MidiMan instance
let mainWindow: BrowserWindow;

export const setMainWindow = (window: BrowserWindow) => {
  mainWindow = window;
};
const emitWatchStartResult = (fileNames: string[]) => {
  mainWindow.webContents.send(IPC_CHANNELS.MIDI_FILES_LIST, fileNames);
};
export const setMidiMan = (midiManInstance: MidiMan) => {
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
    }
  });

  // Handle watch start/stop commands
  ipcMain.on(IPC_CHANNELS.START_WATCHING, (_, directory: string) => {
    if (midiManInstance && directory) {
      console.log("START_WATCHING", directory);
      // prolyl handle if this is false
      const success = midiManInstance.setWatcher(
        directory,
        emitWatchStartResult
      );

      mainWindow.webContents.send(IPC_CHANNELS.WATCH_STATUS_CHANGED, success);
    } else {
      console.error("MidiMan instance not set or directory is empty");
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
