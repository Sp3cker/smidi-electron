import { Button } from "@renderer/ui";
import { useCallback, useEffect, useState } from "react";
import { IPC_CHANNELS } from "../../../../shared/ipc";
import { StatusCircle } from "@renderer/ui/StatusCircle/StatusCircle";

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
    window.api.browseExpansionDirectory().then((directory) => {
      setExpansionDir(directory);
    });
  }, []);

  useEffect(() => {
    // After receiving new config from main, update state
    setExpansionDir(configExpansionDir);
  }, [configExpansionDir]);
  return (
    <div className="h-full overflow-y-auto pb-20">
      <div className="p-2">
        <h3 className="text-xl/6 pb-1 font-bold">Expansion Directory</h3>
        <p className="text-xl/4 pb-1 font-pkmnem">
          Your voicegroups and <code className="text-sm">midi2agb</code>{" "}
          executable will be derived from this.
        </p>
        <input
          className="input w-full"
          type="text"
          value={expansionDir}
          onChange={(e) => setExpansionDir(e.currentTarget.value)}
          onBlur={handleBlur}
        />
        <Button onMouseDown={handleBrowse}>Browse</Button>
      </div>
      <StatusCircle
        label="Voicegroups Loaded"
        beGray={false}
        indicateSuccess={false}
      />
    </div>
  );
};

export default Directories;
