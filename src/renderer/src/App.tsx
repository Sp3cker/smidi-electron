import { Watch, List, VoiceGroups } from "./components";
import { useLayoutEffect, useRef } from "react";
import useConfigStore from "./store/useConfigStore";
import { GlobalConfig } from "./components/GlobalConfig";
import ToastContainer from "./ui/Toast/ToastContainer";

function App() {
  const { isLoading, config, getConfig } = useConfigStore();
  const hasRequestedConfig = useRef(false);

  useLayoutEffect(() => {
    if (!config && isLoading && !hasRequestedConfig.current) {
      hasRequestedConfig.current = true;
      getConfig();
    } else if (config) {
      console.log("config loaded", config);
    }
  }, [config, isLoading, getConfig]);

  return (
    <main className="flex h-screen  bg-[var(--color-neir-lighter)] p-1">
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <Watch />
            <List />
            <div className="p-2"></div>
            <VoiceGroups />
          </>
        )}
      </div>
      <GlobalConfig />
      <ToastContainer />
    </main>
  );
}

export default App;
