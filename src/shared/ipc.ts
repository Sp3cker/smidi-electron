// IPC Channel definitions
export const IPC_CHANNELS = {
  // From renderer to main
  OPEN_WATCH_DIRECTORY: "open-watch-directory",
  START_WATCHING: "start-watching",
  STOP_WATCHING: "stop-watching",
/** Renderer has loaded, is asking for config */
  GET_CONFIG: "get-config",
  /** Renderer is sending a new configuration or key:value to save */
  UPDATE_CONFIG: "update-config",
  
  // From main to renderer
  SET_WATCH_DIRECTORY: "set-watch-directory",
  WATCH_STATUS_CHANGED: "watch-status-changed",
  FILE_CHANGED: "file-changed",
  MIDI_FILES_LIST: "midi-files-list",
  NEW_CONFIG: "new-config",
  /** Broadcast application errors to the renderer */
  APP_ERROR: "app-error",
} as const;
