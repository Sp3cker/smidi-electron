import { BrowserWindow, MessageChannelMain, MessagePortMain } from "electron";
import { randomUUID } from "crypto";

/**
 * Bootstrap + dynamic stream channel manager.
 * Keeps main <-> renderer high-throughput channels off ipcMain.
 */

interface StreamRecord {
  id: string;
  port: MessagePortMain;
}

let bootstrapPort: MessagePortMain | null = null;
const streams = new Map<string, StreamRecord>();
let bootstrapReady = false;
const bootstrapWaiters: (() => void)[] = [];

function resolveBootstrapWaiters() {
  bootstrapReady = true;
  while (bootstrapWaiters.length) bootstrapWaiters.shift()?.();
}

/** Call once per BrowserWindow after ready-to-show */
export function initMessageChannels(win: BrowserWindow) {
  if (bootstrapPort) return; // already initialised for first window
  const { port1, port2 } = new MessageChannelMain();
  bootstrapPort = port1;
  port1.on("message", (ev) => onBootstrapMessage(win, ev.data));
  port1.start();
  win.webContents.postMessage("bootstrap-port", { t: "bootstrap" }, [port2]);
  resolveBootstrapWaiters();
}

function onBootstrapMessage(_win: BrowserWindow, data: any) {
  if (!data || typeof data !== "object") return;
  switch (data.t) {
    case "open-stream": {
      const id: string = data.id || randomUUID();
      const { port1, port2 } = new MessageChannelMain();
      streams.set(id, { id, port: port1 });
      port1.start();
      bootstrapPort?.postMessage({ t: "stream-open", id }, [port2]);
      break;
    }
    case "close-stream": {
      const rec = streams.get(data.id);
      if (rec) {
        rec.port.close();
        streams.delete(data.id);
      }
      break;
    }
    default:
      break;
  }
}

function ensureBootstrap(): Promise<void> {
  if (bootstrapReady) return Promise.resolve();
  return new Promise((res) => bootstrapWaiters.push(res));
}

export async function createStream(_win: BrowserWindow, id?: string) {
  await ensureBootstrap();
  const streamId = id || randomUUID();
  const { port1, port2 } = new MessageChannelMain();
  streams.set(streamId, { id: streamId, port: port1 });
  port1.start();
  bootstrapPort?.postMessage({ t: "stream-open", id: streamId }, [port2]);
  return {
    id: streamId,
    send: (message: any, transfer?: MessagePortMain[] | any[]) => {
      port1.postMessage(message, transfer as any);
    },
    close: () => {
      port1.close();
      streams.delete(streamId);
      bootstrapPort?.postMessage({ t: "stream-closed", id: streamId });
    },
    port: port1,
  };
}

export function sendToStream(id: string, message: any, transfer?: any[]) {
  const rec = streams.get(id);
  rec?.port.postMessage(message, transfer as any);
}

export function closeStream(id: string) {
  const rec = streams.get(id);
  if (!rec) return;
  rec.port.close();
  streams.delete(id);
  bootstrapPort?.postMessage({ t: "stream-closed", id });
}
