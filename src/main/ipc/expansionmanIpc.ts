import { ipcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc";
import type ExpansionManager from "../ExpansionMan/ExpansionManager";

export const setExpansionManIpc = (expansionManager: ExpansionManager) => {
  ipcMain.handle(
    IPC_CHANNELS.VOICEGROUPS.GET_VOICEGROUPS,
    async (_: IpcMainInvokeEvent) => {
      await expansionManager.getVoiceGroups();

      return expansionManager.voiceGroups;
    }
  );
};
