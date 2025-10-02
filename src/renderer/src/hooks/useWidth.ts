import { useEffect, useState } from "react";

/**
 * Hook to get the parent container's width using ResizeObserver
 */
export const useWidth = (ref: React.RefObject<HTMLElement>) => {
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return width;
};
