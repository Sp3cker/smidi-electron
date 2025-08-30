import { IPC_CHANNELS } from "../../../shared/ipc";
import { toast } from "../ui";
import { AppErrorPayload } from "../../../shared/error";
import type { DomainError } from "../../../shared/dto";

export const onAppError = () => {
  window.electron.ipcRenderer.on(
    IPC_CHANNELS.APP_ERROR,
    (
      _event,
      payload: { success: boolean; error: AppErrorPayload | DomainError }
    ) => {
      // Handle both legacy and new error formats
      toast.error(payload.error.message);
    }
  );
};
