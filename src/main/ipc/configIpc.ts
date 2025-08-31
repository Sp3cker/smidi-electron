import { dialog, ipcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc";
import type Config from "../Config/Config";
import type { DomainError } from "../../shared/dto";

/**Caller needs to catch error */
const sendConfigToRenderer = (event: IpcMainInvokeEvent, config: Config) => {
  const currConfig = config.getConfig();
  if (!currConfig) {
    throw new Error("No configuration found in the system");
  }
  console.debug("Main: sending config to renderer", currConfig);
  event.sender.send(IPC_CHANNELS.CONFIG.CONFIG_UPDATED, {
    success: true,
    data: currConfig,
  });
  // ipcMain.emit(IPC_CHANNELS.CONFIG.CONFIG_UPDATED, currConfig);
};
/**Sets up listeners for app asking for config, sending config to app */
export const setConfigIpc = (config: Config) => {
  ipcMain.on(
    IPC_CHANNELS.CONFIG.UPDATE_EXPANSION_DIR,
    (event, value: string) => {
      try {
        console.debug("Main: 1. updated expansion dir from renderer", value);
        // Domain validation
        if (config.isValidExpansionDirectory(value) === false) {
          const domainError: DomainError = {
            message: "Invalid configuration key provided",
            code: "INVALID_CONFIG_KEY",
            details: { providedKey: value },
          };

          event.sender.send(IPC_CHANNELS.APP_ERROR, {
            success: false,
            error: domainError,
          });
          return;
        }
        console.debug("Main: 2. dir from render is valid path, executing");
        // Execute domain command
        config.updateExpansionDir(value);

        console.debug("Main: config updated successfully");
        sendConfigToRenderer(event, config);
      } catch (error) {
        console.debug(error);

        const domainError: DomainError = {
          message: "Failed to update configuration",
          code: "UPDATE_FAILED",
          details: {
            originalError:
              error instanceof Error ? error.message : String(error),
          },
        };

        event.sender.send(IPC_CHANNELS.APP_ERROR, {
          success: false,
          error: domainError,
        });
      }
    }
  );
  ipcMain.on(IPC_CHANNELS.CONFIG.GET_CONFIG, (event) => {
    try {
      console.debug("Main: received config request from renderer");

      sendConfigToRenderer(event, config);
    } catch (error) {
      console.debug(error);

      const domainError: DomainError = {
        message: "Failed to retrieve configuration",
        code: "RETRIEVAL_FAILED",
        details: {
          originalError: error instanceof Error ? error.message : String(error),
        },
      };

      event.sender.send(IPC_CHANNELS.APP_ERROR, {
        success: false,
        error: domainError,
      });
    }
  });
  ipcMain.on(IPC_CHANNELS.CONFIG.RESET_CONFIG, (event) => {
    console.debug("Main: reset config command received");
    try {
      config.resetConfig();
      event.sender.send(IPC_CHANNELS.CONFIG.CONFIG_WAS_RESET);
      // CONFIG IS SENT AFTER TRY/CATCH! LOOK DOWN!
    } catch (error) {
      console.debug(error);
      const domainError: DomainError = {
        message: "Failed to reset configuration",
        code: "RESET_FAILED",
        details: {
          originalError: error instanceof Error ? error.message : String(error),
        },
      };
      event.sender.send(IPC_CHANNELS.APP_ERROR, {
        success: false,
        error: domainError,
      });
      return;
    }
    // Either way, we send the new config to the renderer
    sendConfigToRenderer(event, config);
  }); // Reset config
  ipcMain.on(IPC_CHANNELS.CONFIG.BROWSE_EXPANSION_DIRECTORY, (event) => {
    console.debug("Main: open expansion directory command received");
    try {
      const dir = dialog.showOpenDialogSync({
        properties: ["openDirectory"],
      });
      if (dir) {
        config.updateExpansionDir(dir[0]);
        sendConfigToRenderer(event, config);
      }
    } catch (error) {
      console.debug(error);
      const domainError: DomainError = {
        message: "Failed to open expansion directory",
        code: "OPEN_FAILED",
        details: {
          originalError: error instanceof Error ? error.message : String(error),
        },
      };
      event.sender.send(IPC_CHANNELS.APP_ERROR, {
        success: false,
        error: domainError,
      });
    }
  });
};
