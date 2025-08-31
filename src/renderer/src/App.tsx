import { Watch, ContextMenuExample, List } from "./components";
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
      <h1 className="text-xl font-bold ">Decomp Midi Arranger</h1>
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <Watch />
            <List />
            <ContextMenuExample />
            <GlobalConfig />
          </>
        )}
      </div>
      <ToastContainer />
    </main>
  );
}

export default App;
