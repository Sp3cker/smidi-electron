import { memo, useCallback, useEffect } from "react";

import { motion, useSpring } from "motion/react";
import CloseButton from "@renderer/ui/CloseButton";
import { useConfigStoreWithSelectors } from "@renderer/store/useConfigStore";
import ConsoleOutput from "./ConsoleOutput";
import ConsoleButton from "./ConsoleButton";

const Console = memo(function Console() {
  const consoleOpen = useConfigStoreWithSelectors.use.consoleOpen();

  const setConsoleOpen = useConfigStoreWithSelectors.use.setConsoleOpen();

  // Spring animations for sliding in from the left
  const translateY = useSpring("100%", { stiffness: 300, damping: 30 });

  useEffect(() => {
    if (consoleOpen) {
      translateY.set("-100%");
    } else {
      translateY.set("100%");
    }
  }, [consoleOpen]);

  const handleClose = useCallback(() => {
    translateY.set("-100%");
    setConsoleOpen(false);
  }, []);

  return (
    <>
      <ConsoleButton />

      <motion.nav
        style={{ translateY }}
        className=" fixed bottom-0 left-1/10 origin-[25%_75%] w-80 max-w-[80vw] bg-[var(--yatsugi-grey-1)] overflow-hidden  shadow-2xl"
      >
        <div className="p-1  top-0 z-10 flex flex-row items-center justify-between border-b border-gray-200 ">
          <div className="flex flex-col flex-2 items-start justify-between pb-1">
            <h3 className="text-lg">Console</h3>
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

        <div className="flex-1 justify-end h-full">
          <ConsoleOutput />
        </div>
      </motion.nav>
    </>
  );
});

export default Console;
