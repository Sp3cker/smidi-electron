// IPC Channel definitions
export const IPC_CHANNELS = {
  // From renderer to main
  OPEN_WATCH_DIRECTORY: "open-watch-directory",
  START_WATCHING: "start-watching",
  STOP_WATCHING: "stop-watching",

  // From main to renderer
  SET_WATCH_DIRECTORY: "set-watch-directory",
  WATCH_STATUS_CHANGED: "watch-status-changed",
  FILE_CHANGED: "file-changed",
} as const;
