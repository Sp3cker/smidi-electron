import { memo, useRef } from "react";
import { useConfigStoreWithSelectors } from "@renderer/store/useConfigStore";

interface ConsoleButtonProps {
  className?: string;
}

const ConsoleButton = memo(function ConsoleButton({
  className,
}: ConsoleButtonProps) {
  const setConsoleOpen = useConfigStoreWithSelectors(
    (state) => state.setConsoleOpen
  );

  const buttonRef = useRef<HTMLButtonElement>(null);
  const handleClick = () => {
    setConsoleOpen(true);
  };

  return (
    <button
      ref={buttonRef}
      className={`button bg-[var(--color-neir)]  fixed bottom-0 left-[15rem] -translate-y-[-0.5rem] cursor-pointer rounded-l-lg rounded-r-lg px-3 py-0.5 shadow-lg  ${className || ""}`}
      onClick={handleClick}
    >
      <span className="text-neir-dark font-bold">Console</span>
    </button>
  );
});

export default ConsoleButton;
