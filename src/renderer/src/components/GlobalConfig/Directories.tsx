import { Button } from "@renderer/ui";
import { useCallback, useEffect, useState } from "react";
import { IPC_CHANNELS } from "../../../../shared/ipc";

type DirectoriesProps = {
  configExpansionDir: string;
  handleSubmit: (value: string) => void;
};

const Directories = ({
  configExpansionDir,
  handleSubmit,
}: DirectoriesProps) => {
  const [expansionDir, setExpansionDir] = useState(configExpansionDir);

  const handleBlur = useCallback(() => {
    if (expansionDir === configExpansionDir) {
      return;
    }
    handleSubmit(expansionDir);
  }, [expansionDir, configExpansionDir, handleSubmit]);

  const handleBrowse = useCallback(() => {
    window.electron.ipcRenderer.send(
      IPC_CHANNELS.CONFIG.BROWSE_EXPANSION_DIRECTORY
    );
  }, []);

  useEffect(() => {
    // After receiving new config from main, update state
    setExpansionDir(configExpansionDir);
  }, [configExpansionDir]);
  return (
    <div className="h-full overflow-y-auto pb-20">
      <div className="p-2">
        <h3 className="text-lg/4 font-bold">Expansion Directory</h3>
        <p className="text-xl/6 font-pkmnem">
          The path to the root of your Expansion repo.{" "}
        </p>
        <input
          className="input w-full"
          type="text"
          value={expansionDir}
          onChange={(e) => setExpansionDir(e.currentTarget.value)}
          onBlur={handleBlur}
        />
        <Button onClick={handleBrowse}>Browse</Button>
      </div>
    </div>
  );
};

export default Directories;
