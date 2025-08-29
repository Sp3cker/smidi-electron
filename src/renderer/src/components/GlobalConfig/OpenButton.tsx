import { memo, useEffect, useRef } from "react";
import { useConfigStoreWithSelectors } from "@renderer/store/useConfigStore";

interface OpenButtonProps {
  className?: string;
}
let currentAnimation: Animation | null = null;

const moveAnimation = (ref: HTMLButtonElement, dir: string) => {
  if (currentAnimation) {
    currentAnimation.cancel();
    currentAnimation = null;
  }

  const animation = [
    { transform: "translateX(0%)" },
    { transform: "translateX(-89%)" },
  ];

  if (dir === "back") {
    animation.reverse();
  }

  currentAnimation = ref.animate(animation, {
    duration: 200,
    easing: "ease-out",
    fill: "forwards",
  });

  currentAnimation.addEventListener("finish", () => {
    currentAnimation = null;
  });

  currentAnimation.addEventListener("cancel", () => {
    currentAnimation = null;
  });

  return currentAnimation;
};
const OpenButton = memo(function OpenButton({ className }: OpenButtonProps) {
  const setConfigDrawerOpen = useConfigStoreWithSelectors(
    (state) => state.setConfigDrawerOpen
  );

  const buttonRef = useRef<HTMLButtonElement>(null);
  const handleClick = () => {
    setConfigDrawerOpen(true);
  };

  return (
    <button
      ref={buttonRef}
      className={`button bg-[var(--color-neir-dark)] top-4/5 fixed left-0 -translate-y-1/2 cursor-pointer rounded-r-sm px-2 py-4 shadow-lg  ${className || ""}`}
      onClick={handleClick}
    >
      Ξ
    </button>
  );
});

export default OpenButton;
