import { List, VoiceGroups } from "./components";
import { useLayoutEffect, useRef } from "react";
import useConfigStore from "./store/useConfigStore";
import { GlobalConfig } from "./components/GlobalConfig";
import ToastContainer from "./ui/Toast/ToastContainer";
import { TabBar } from "./components/TabBar";
import { Console } from "./components/Console";
import { Route, Router, Switch } from "wouter";

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
        <Router>
          <TabBar />
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Switch>
              <Route path="/voice-groups" component={VoiceGroups} />
              <Route path="/" component={List} />

              <div className="p-2"></div>
              <VoiceGroups />
            </Switch>
          )}
        </Router>
      </div>
      <GlobalConfig />
      <Console />
      <ToastContainer />
    </main>
  );
}

export default App;
