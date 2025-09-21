import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc";
import type VoicegroupsService from "../services/Voicegroups/VoicegroupsService";
type SendToStreamFunction = (
  id: string,
  message: any,
  transfer?: any[]
) => void;
export const setVoicegroupsIpc = (
  voicegroupsService: VoicegroupsService,
  sendToStream: SendToStreamFunction
) => {
  ipcMain.handle(IPC_CHANNELS.VOICEGROUPS.GET_VOICEGROUPS, async (_) => {
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
        // sendToStream("voicegroup-details", { voicegroupDetails });
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
