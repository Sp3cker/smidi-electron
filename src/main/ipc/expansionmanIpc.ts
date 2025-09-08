import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc";
import type ExpansionManager from "../services/ExpansionMan/ExpansionManager";

export const setExpansionManIpc = (expansionManager: ExpansionManager) => {
  ipcMain.handle(IPC_CHANNELS.VOICEGROUPS.GET_VOICEGROUPS, async (event) => {
    try {
      const voiceGroups = await expansionManager.getVoiceGroups();

      return voiceGroups;
    } catch (error) {
      return error;
      // event.sender.send(IPC_CHANNELS.APP_ERROR, {
      //   success: false,
      //   detail: (error as Error).message,
      // });
      return [];
    }
  });
  ipcMain.handle(
    IPC_CHANNELS.VOICEGROUPS.GET_VOICEGROUP_DETAILS,
    async (event, voicegroupName: string) => {
      try {
        const voicegroupDetails =
          await expansionManager.getVoicegroupDetails(voicegroupName);
        return voicegroupDetails;
      } catch (error) {
        event.sender.send(IPC_CHANNELS.APP_ERROR, {
          success: false,
          detail: (error as Error).message,
        });
        return [];
      }
    }
  );
};
