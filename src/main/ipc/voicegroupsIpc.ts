import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc";
import type VoicegroupsService from "../services/Voicegroups/VoicegroupsService";

export const setVoicegroupsIpc = (voicegroupsService: VoicegroupsService) => {
  ipcMain.handle(IPC_CHANNELS.VOICEGROUPS.GET_VOICEGROUPS, async (event) => {
    try {
      const voiceGroups = await voicegroupsService.getVoiceGroups();

      return { success: true, data: voiceGroups };
    } catch (error) {
      console.debug("VoicegroupsIpc: Error getting voice groups", error);
      return { success: false, error: "Error getting voice groups" };
    }
  });
  ipcMain.handle(
    IPC_CHANNELS.VOICEGROUPS.GET_VOICEGROUP_DETAILS,
    async (event, voicegroupName: string) => {
      try {
        const voicegroupDetails =
          await voicegroupsService.getVoicegroupDetails(voicegroupName);
        return { success: true, data: voicegroupDetails };
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
