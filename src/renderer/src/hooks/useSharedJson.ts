import { useCallback, useEffect, useRef, useState } from "react";

interface StreamMessage {
  t: string;
  [k: string]: any;
}

export function useMessageStream(streamId?: string) {
  const [ready, setReady] = useState(false);
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const portRef = useRef<MessagePort | null>(null);
const handleListenStream = useCallback(() => {
    window.api
      .requestStream(streamId)
      .then(({ port }) => {
        if (cancelled) return;
        portRef.current = port;
        port.onmessage = (e) => {
            console.log(e)
          const msg = e.data;
          setMessages((prev) => prev.concat(msg));
          if (msg?.t === "end") port.close();
        };
        setReady(true);
      })
      .catch(console.error);
},[ready]
  useEffect(() => {
    let cancelled = false;
    
    return () => {
      cancelled = true;
      portRef.current?.close();
    };
  }, [streamId]);

  const send = (msg: any, transfer?: Transferable[]) => {
    portRef.current?.postMessage(msg, transfer || []);
  };

  return { ready, messages, send, port: portRef.current };
}
