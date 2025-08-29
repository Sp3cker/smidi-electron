import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc";
import type Config from "../Config/Config";

/**Sets up listeners for app asking for config, sending config to app */
export const setConfigIpc = (config: Config) => {
  ipcMain.on(IPC_CHANNELS.CONFIG_UPDATED, (event, values: [string, string]) => {
    if (typeof values === "string") {
      throw new Error("Invalid values");
    }
    try {
      config.writeConfig(values);
      // Send confirmation back
      console.log("config sent to app");
      event.sender.send(IPC_CHANNELS.CONFIG_LOAD, {
        success: true,
        data: values,
      });
    } catch (error) {
      event.sender.send(IPC_CHANNELS.CONFIG_LOAD, {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
  ipcMain.on(IPC_CHANNELS.GET_CONFIG, (event) => {
    const savedConfig = config.getConfig();
    console.log("savedConfig", savedConfig);
    if (!savedConfig) {
      event.sender.send(IPC_CHANNELS.CONFIG_LOAD, {
        success: false,
        error: "No config found",
      });
    }
    event.sender.send(IPC_CHANNELS.CONFIG_LOAD, {
      success: true,
      data: config.getConfig(),
    });
  });
};
