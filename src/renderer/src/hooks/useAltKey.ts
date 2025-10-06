// Example: src/renderer/src/components/List/useAltHold.ts
import { useEffect, useRef } from "react";

export function useAltKey(
  onHold: () => void,
  onRelease?: () => void,
  holdMs = 0
) {
  const altDown = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // e.altKey is true for any keydown while Alt held; check key === 'Alt' for the Alt key itself
      if (!altDown.current && (e.key === "Alt" || e.key === "AltGraph")) {
        altDown.current = true;
        if (holdMs > 0) {
          timer.current = window.setTimeout(() => onHold(), holdMs);
        } else {
          onHold();
        }
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (altDown.current && (e.key === "Alt" || e.key === "AltGraph")) {
        altDown.current = false;
        if (timer.current) {
          clearTimeout(timer.current);
          timer.current = null;
        }
        onRelease?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keyup", handleKeyUp, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("keyup", handleKeyUp, { capture: true });
      if (timer.current) clearTimeout(timer.current);
    };
  }, [onHold, onRelease, holdMs]);
}
