import { IPC_CHANNELS } from "../../../shared/ipc";
import { toast } from "../ui";
import { AppErrorPayload } from "../../../shared/error";
export const onAppError = () => {
  window.electron.ipcRenderer.on(
    IPC_CHANNELS.APP_ERROR,
    (_event, payload: AppErrorPayload) => {
      const title = payload.origin ? `Error: ${payload.origin}` : "Error";
      toast.error(payload.message, { title });
    }
  );
};
