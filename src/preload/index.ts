import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { IPC_CHANNELS } from "../shared/ipc";

// Custom APIs for renderer
let bootstrapPort: MessagePort | null = null;
const pendingStreamResolvers = new Map<string, (port: MessagePort) => void>();

window.addEventListener("message", (e: MessageEvent) => {
  const { data } = e;
  if (data?.t === "bootstrap") {
    if (e.ports && e.ports[0]) {
      bootstrapPort = e.ports[0];
      bootstrapPort.start();
      bootstrapPort.onmessage = (evt) => {
        const msg = evt.data;
        if (msg?.t === "stream-open" && evt.ports && evt.ports[0]) {
          const port = evt.ports[0];
          port.start();
          const resolve = pendingStreamResolvers.get(msg.id);
          if (resolve) {
            pendingStreamResolvers.delete(msg.id);
            resolve(port);
          }
        }
      };
    }
  }
});

function requestStream(
  id?: string
): Promise<{ id: string; port: MessagePort }> {
  return new Promise((resolve, reject) => {
    const streamId = id || Math.random().toString()
    if (!bootstrapPort) {
      return reject(new Error("Bootstrap port not ready"));
    }
    pendingStreamResolvers.set(streamId, (port) =>
      resolve({ id: streamId, port })
    );
    bootstrapPort.postMessage({ t: "open-stream", id: streamId });
  });
}

const api = {
  getVoiceGroups: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.VOICEGROUPS.GET_VOICEGROUPS);
  },
  browseExpansionDirectory: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.CONFIG.BROWSE_EXPANSION_DIRECTORY);
  },
  requestStream,
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
