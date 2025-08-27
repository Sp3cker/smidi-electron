import { ipcMain, dialog, BrowserWindow } from "electron";
import { IPC_CHANNELS } from '../shared/ipc';
import MidiMan from './MidiMan/MidiMan';

// Get the main window reference and MidiMan instance
let mainWindow: BrowserWindow;
let midiMan: MidiMan;

export const setMainWindow = (window: BrowserWindow) => {
  mainWindow = window;
};

export const setMidiMan = (midiManInstance: MidiMan) => {
  midiMan = midiManInstance;
};

// Handle directory selection dialog
ipcMain.on(IPC_CHANNELS.OPEN_WATCH_DIRECTORY, async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    mainWindow.webContents.send(IPC_CHANNELS.SET_WATCH_DIRECTORY, result.filePaths[0]);
  }
});

// Handle watch start/stop commands
ipcMain.on(IPC_CHANNELS.START_WATCHING, (_, directory: string) => {
  if (midiMan && directory) {
    midiMan.setWatcher(directory);
    // Notify renderer that watching has started
    mainWindow.webContents.send(IPC_CHANNELS.WATCH_STATUS_CHANGED, true);
  }
});

ipcMain.on(IPC_CHANNELS.STOP_WATCHING, () => {
  if (midiMan) {
    midiMan.endWatch();
    // Notify renderer that watching has stopped
    mainWindow.webContents.send(IPC_CHANNELS.WATCH_STATUS_CHANGED, false);
  }
});
