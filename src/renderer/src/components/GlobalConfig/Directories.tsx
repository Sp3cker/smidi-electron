import { useCallback, useState } from "react";

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
  return (
    <div className="h-full overflow-y-auto pb-20">
      <div className="p-2">
        <h3 className="text-lg font-bold">Expansion Directory</h3>
        <input
          className="input w-full"
          type="text"
          value={expansionDir}
          onChange={(e) => setExpansionDir(e.currentTarget.value)}
          onBlur={handleBlur}
        />
        <p></p>
      </div>
    </div>
  );
};

export default Directories;
