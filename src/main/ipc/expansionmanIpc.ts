import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc";
import type ExpansionManager from "../ExpansionMan/ExpansionManager";

export const setExpansionManIpc = (expansionManager: ExpansionManager) => {
  ipcMain.handle(IPC_CHANNELS.VOICEGROUPS.GET_VOICEGROUPS, async (event) => {
    try {
      await expansionManager.getVoiceGroups();

      return expansionManager.voiceGroups;
    } catch (error) {
      event.sender.send(IPC_CHANNELS.APP_ERROR, {
        success: false,
        detail: (error as Error).message,
      });
      return [];
    }
  });
};
