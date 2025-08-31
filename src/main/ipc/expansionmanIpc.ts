import { ipcMain, IpcMainEvent } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc";
import type ExpansionManager from "../ExpansionMan/ExpansionManager";

export const setExpansionManIpc = (expansionManager: ExpansionManager) => {
  ipcMain.on(
    IPC_CHANNELS.VOICEGROUPS.GET_VOICEGROUPS,
    (event: IpcMainEvent) => {
      expansionManager.getVoiceGroups();
      console.debug(
        "ExpansionManager: getting voice groups",
        expansionManager.voiceGroups
      );
      event.sender.send(
        IPC_CHANNELS.VOICEGROUPS.GET_VOICEGROUPS,
        expansionManager.voiceGroups
      );
    }
  );
};
