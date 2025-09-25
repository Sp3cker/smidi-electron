import { useCallback, useEffect, useRef, useState } from "react";

interface StreamMessage {
  t: string;
  [k: string]: unknown;
}

export function useMessageStream(streamId?: string) {
  const [ready, setReady] = useState(false);
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const portRef = useRef<MessagePort | null>(null);
  const handleListenStream = useCallback(
    (cancelled: boolean) => {
      window.api
        .requestStream(streamId)
        .then(({ port }) => {
          if (cancelled) return;
          portRef.current = port;
          port.onmessage = (e) => {
            setMessages((prev) => prev.concat(e.data));
            if (e.data?.t === "end") port.close();
          };
          setReady(true);
          return port;
        })
        .catch(console.error);
    },
    [streamId]
  );

  useEffect(() => {
    let cancelled = false;
    handleListenStream(cancelled);
    return () => {
      cancelled = true;
      portRef.current?.close();
    };
  }, [handleListenStream]);

  const send = (msg: StreamMessage, transfer?: Transferable[]) => {
    portRef.current?.postMessage(msg, transfer || []);
  };

  return { ready, messages, send, port: portRef.current };
}
