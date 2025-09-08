// IPC Channel definitions
export const IPC_CHANNELS = {
  CONFIG: {
    /** Renderer has loaded, is asking for config */
    GET_CONFIG: "get-config",
    /** Renderer is sending a new configuration or key:value to save */
    UPDATE_CONFIG: "update-config",
    RESET_CONFIG: "reset-config",
    BROWSE_EXPANSION_DIRECTORY: "browse-expansion-directory",
    // FROM MAIN TO RENDERER
    CONFIG_UPDATED: "config-updated",
    UPDATE_EXPANSION_DIR: "update-expansion-dir",
    CONFIG_WAS_RESET: "config-was-reset",
  },
  VOICEGROUPS: {
    GET_VOICEGROUPS: "get-voicegroups",
    GET_VOICEGROUP_DETAILS: "get-voicegroup-details",
  },
  MIDI_MAN: {
    MIDI_FILES: "midi-files",
  },
  // From renderer to main
  OPEN_WATCH_DIRECTORY: "open-watch-directory",
  START_WATCHING: "start-watching",
  STOP_WATCHING: "stop-watching",

  // From main to renderer
  SET_WATCH_DIRECTORY: "set-watch-directory",
  WATCH_STATUS_CHANGED: "watch-status-changed",
  FILE_CHANGED: "file-changed",
  /** Broadcast application errors to the renderer */
  APP_ERROR: "app-error",
} as const;
