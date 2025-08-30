import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc";
import type Config from "../Config/Config";
import type { ConfigResponse, ConfigRow } from "../../shared/dto";
import type { DomainError } from "../../shared/dto";

/**Sets up listeners for app asking for config, sending config to app */
export const setConfigIpc = (config: Config) => {
  ipcMain.on(
    IPC_CHANNELS.CONFIG.UPDATE_EXPANSION_DIR,
    (event, value: string) => {
      try {
        console.debug("Main: 1. updated expansion dir from renderer", value);
        // Domain validation
        if (!isValidExpansionDirectory(value)) {
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

        // Execute domain command
        config.updateExpansionDir(value);

        const configRow = config.getConfig();

        const response: ConfigResponse = {
          success: true,
          //@ts-ignore
          data: configRow,
        };

        console.debug("Main: config updated successfully");
        event.sender.send(IPC_CHANNELS.CONFIG.CONFIG_UPDATED, response);
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
      const savedConfig = config.getConfig();
      console.log("Main: sending config to renderer", savedConfig);

      if (!savedConfig) {
        const domainError: DomainError = {
          message: "No configuration found in the system",
          code: "CONFIG_NOT_FOUND",
        };

        const response: ConfigResponse = {
          success: false,
          error: domainError,
        };
        event.sender.send(IPC_CHANNELS.CONFIG.CONFIG_UPDATED, response);
        return;
      }

      const configRow = savedConfig as ConfigRow;
      console.log("Main: config sent to renderer on init", configRow);

      const response: ConfigResponse = {
        success: true,
        //@ts-ignore
        data: configRow,
      };

      event.sender.send(IPC_CHANNELS.CONFIG.CONFIG_UPDATED, response);
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
};

//

function isValidExpansionDirectory(path: string): boolean {
  // Business rule: must be a valid Unix-style absolute path
  return /^((\/[a-zA-Z0-9-_]+)+|\/)$/.test(path);
}
