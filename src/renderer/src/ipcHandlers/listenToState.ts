import { IPC_CHANNELS } from "../../../shared/ipc";

export const createIPCListener = <T>(
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

export const onFileChanged = (callback: (filePath: string) => void) => {
  return createIPCListener(IPC_CHANNELS.FILE_CHANGED, (_, filePath: string) => {
    callback(filePath);
  });
};
