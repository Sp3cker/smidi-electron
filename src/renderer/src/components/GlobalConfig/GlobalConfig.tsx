import { memo, useCallback, useEffect, useRef } from "react";

import { motion, useSpring } from "motion/react";
import CloseButton from "@renderer/ui/CloseButton";
import { useConfigStoreWithSelectors } from "@renderer/store/useConfigStore";
import OpenButton from "./OpenButton";
import { Input } from "@renderer/ui/Input";

// Stable className for Clock to prevent re-renders

// Extract unique map IDs from the mapsvgs data

// Type for a clickable map area/location

// Component to render individual place item

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
  const setConfigDrawerOpen =
    useConfigStoreWithSelectors.use.setConfigDrawerOpen();
  // Spring animations for sliding in from the left
  const translateX = useSpring("-100%", { stiffness: 300, damping: 30 });

  const backdropRef = useRef<HTMLDivElement>(null);

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
        <div className="sticky top-0 z-10 flex flex-col items-center justify-between border-b border-gray-200 bg-[var(--yatsugi-white)] p-2">
          <div className="flex w-full justify-end">
            <CloseButton
              onClick={handleClose}
              variant="minimal"
              aria-label="Close Places List"
              className="text-neutral-700 hover:bg-neutral-300"
            />
          </div>
          <div className="flex w-full flex-row items-start justify-between pl-1">
            <div>
              <div className="flex flex-col items-start justify-between pb-1">
                <h3 className="font-bold">Decomp Midi Arranger</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="h-full overflow-y-auto pb-20">
          <div className="p-2">
            <Input
              label="Username"
              type="text"
              placeholder="Enter your username"
              className="mb-4 w-full"
            />
          </div>
        </div>
      </motion.nav>
    </>
  );
});

export default GlobalConfig;
