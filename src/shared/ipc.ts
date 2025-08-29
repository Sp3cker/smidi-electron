// IPC Channel definitions
export const IPC_CHANNELS = {
  // From renderer to main
  OPEN_WATCH_DIRECTORY: "open-watch-directory",
  START_WATCHING: "start-watching",
  STOP_WATCHING: "stop-watching",
  CONFIG_UPDATED: "config-updated",
  GET_CONFIG: "get-config",
  UPDATE_CONFIG: "update-config",
  // From main to renderer
  SET_WATCH_DIRECTORY: "set-watch-directory",
  WATCH_STATUS_CHANGED: "watch-status-changed",
  FILE_CHANGED: "file-changed",
  MIDI_FILES_LIST: "midi-files-list",
  CONFIG_LOAD: "config-load",
} as const;
