import { memo, useCallback, useEffect, useRef } from "react";

import { motion, useSpring } from "motion/react";
import CloseButton from "@renderer/ui/CloseButton";
import { useConfigStoreWithSelectors } from "@renderer/store/useConfigStore";
import OpenButton from "./OpenButton";
import Directories from "./Directories";
import { useToastStore } from "@renderer/ui/Toast/ToastStore";

let currentBackdropAnimation: Animation | null = null;

const animateBackdrop = (
  backdrop: HTMLDivElement,
  direction: "show" | "hide",
  onFinish?: () => void
) => {
  if (currentBackdropAnimation) {
    currentBackdropAnimation.cancel();
    currentBackdropAnimation = null;
  }

  const showKeyframes = [
    {
      opacity: 0,
      backdropFilter: "blur(0px)",
      background: "rgba(0, 0, 0, 0.0)",
    },
    {
      opacity: 0.6,
      backdropFilter: "blur(5px)",
      background: "rgba(0, 0, 0, 0.6)",
    },
  ];

  const hideKeyframes = [
    {
      opacity: 0.6,
      backdropFilter: "blur(5px)",
      background: "rgba(0, 0, 0, 0.6)",
    },
    {
      opacity: 0,
      backdropFilter: "blur(0px)",
      background: "rgba(0, 0, 0, 0.0)",
    },
  ];

  if (direction === "show") {
    backdrop.style.display = "block";
  }

  currentBackdropAnimation = backdrop.animate(
    direction === "show" ? showKeyframes : hideKeyframes,
    {
      duration: 200,
      easing: direction === "show" ? "ease-out" : "ease-in",
      fill: "forwards",
    }
  );

  currentBackdropAnimation.addEventListener("finish", () => {
    if (direction === "hide") {
      backdrop.style.display = "none";
    }
    currentBackdropAnimation = null;
    if (onFinish) {
      onFinish();
    }
  });

  currentBackdropAnimation.addEventListener("cancel", () => {
    currentBackdropAnimation = null;
  });

  return currentBackdropAnimation;
};

const GlobalConfig = memo(function GlobalConfig() {
  const configDrawerOpen = useConfigStoreWithSelectors.use.configDrawerOpen();
  const config = useConfigStoreWithSelectors.use.config();
  const updateConfig = useConfigStoreWithSelectors.use.updateConfig();
  const updateExpansionDir =
    useConfigStoreWithSelectors.use.updateExpansionDir();
  const setConfigDrawerOpen =
    useConfigStoreWithSelectors.use.setConfigDrawerOpen();
  const toast = useToastStore();
  // Spring animations for sliding in from the left
  const translateX = useSpring("-100%", { stiffness: 300, damping: 30 });
  const backdropRef = useRef<HTMLDivElement>(null);
  const handleExpansionDirUpdate = useCallback(
    (value: string) => {
      updateExpansionDir(value);
    },
    [updateExpansionDir]
  );
  const handleUpdateConfig = useCallback(
    (key: string, value: any) => {
      updateConfig(key, value);
    },
    [config, updateConfig]
  );

  useEffect(() => {
    const backdrop = backdropRef.current;
    if (!backdrop) return;

    if (configDrawerOpen) {
      translateX.set("0%");
      animateBackdrop(backdrop, "show");
    } else {
      translateX.set("-100%");
      animateBackdrop(backdrop, "hide");
    }
  }, [configDrawerOpen]);

  const handleClose = useCallback(() => {
    const backdrop = backdropRef.current;
    if (!backdrop) return;

    translateX.set("-100%");
    animateBackdrop(backdrop, "hide", () => {
      setConfigDrawerOpen(false);
    });
  }, []);

  return (
    <>
      <div
        ref={backdropRef}
        style={{ display: "none" }}
        className="hidden fixed inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      {!configDrawerOpen && <OpenButton />}

      <motion.nav
        style={{ translateX }}
        className=" fixed bottom-0 left-0 top-0 w-80 max-w-[80vw] bg-[var(--yatsugi-grey-1)] overflow-hidden  shadow-2xl"
      >
        <div className=" p-1 sticky top-0 z-10 flex flex-row items-center justify-between border-b border-gray-200 bg-[var(--yatsugi-white)]">
          <div className="flex flex-col flex-2 items-start justify-between pb-1">
            <h3 className="text-lg">Decomp Midi Arranger</h3>
            <p className="text-sm text-gray-500">Global Config</p>
          </div>
          <div className="flex w-full flex-1 justify-end">
            <CloseButton
              onClick={handleClose}
              variant="minimal"
              aria-label="Close Places List"
              className="text-neutral-700 hover:bg-neutral-300"
            />
          </div>
        </div>
        <button onClick={() => toast.push({ message: "hello" })}>Click</button>
        {config && (
          <Directories
            configExpansionDir={config.expansionDir}
            handleSubmit={handleExpansionDirUpdate}
          />
        )}
      </motion.nav>
    </>
  );
});

export default GlobalConfig;
