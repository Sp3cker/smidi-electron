import { Watch, ContextMenuExample, List } from "./components";
import { useLayoutEffect } from "react";
import useConfigStore from "./store/useConfigStore";

function App() {
  const { isLoading, config, getConfig } = useConfigStore();
  useLayoutEffect(() => {
    if (isLoading) {
      getConfig();
    } else {
      console.log("config loaded", config);
    }
  }, [isLoading]);
  return (
    <main className="flex h-screen flex-col bg-[var(--color-neir-lighter)] p-1">
      <h1 className="text-4xl ">SMidi Musical Editor</h1>
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <Watch />
            <List />
            <ContextMenuExample />
          </>
        )}
      </div>
    </main>
  );
}

export default App;
