import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc";
import type Config from "../Config/Config";

/**Sets up listeners for app asking for config, sending config to app */
export const setConfigIpc = (config: Config) => {
  ipcMain.on(IPC_CHANNELS.UPDATE_CONFIG, (event, values: [string, string]) => {
    if (typeof values === "string") {
      throw new Error("Invalid values");
    }
    // Has to be a filepath
    if (
      values[0] === "expansionDir" &&
      values[1].match(/^((\/[a-zA-Z0-9-_]+)+|\/)$/) === null
    ) {
      event.sender.send(IPC_CHANNELS.NEW_CONFIG, {
        success: false,
        error: "Invalid expansion directory format",
      });
      return;
    }
    try {
      config.writeConfig(values);
      // Send confirmation back
      console.log("config sent to app");
      event.sender.send(IPC_CHANNELS.NEW_CONFIG, {
        success: true,
        data: values,
      });
    } catch (error) {
      event.sender.send(IPC_CHANNELS.NEW_CONFIG, {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
  ipcMain.on(IPC_CHANNELS.GET_CONFIG, (event) => {
    const savedConfig = config.getConfig();
    console.log("savedConfig", savedConfig);
    if (!savedConfig) {
      event.sender.send(IPC_CHANNELS.NEW_CONFIG, {
        success: false,
        error: "No config found",
      });
    }
    event.sender.send(IPC_CHANNELS.NEW_CONFIG, {
      success: true,
      data: config.getConfig(),
    });
  });
};
