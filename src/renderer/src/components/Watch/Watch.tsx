import React, { useEffect, useState } from "react";
import { Input } from "../../ui/Input";
import { useWatchStore } from "../../store";
import { Button } from "../../ui/Button";

const Watch: React.FC = () => {
  const [inputDirectory, setInputDirectory] = useState("");
  const { directory, promptDirectory, setDirectory, isWatching, startWatch } =
    useWatchStore();

  const handleClick = () => {
    if (inputDirectory !== "") {
      setDirectory(inputDirectory);
    }
    startWatch();
  };
  useEffect(() => {
    setInputDirectory(directory);
  }, [directory]);
  return (
    <section>
      <div className="flex flex-row gap-2 items-start justify-start">
        <Input
          label="Directory to watch"
          value={directory ?? ""}
          onChange={(e) => setInputDirectory(e.target.value)}
        />
        <Button
          className="hover-active-button rounded-sm"
          onMouseDown={promptDirectory}
        >
          Browse
        </Button>
        <Button
          className="hover-active-button rounded-sm"
          variant={isWatching ? "secondary" : "primary"}
          onClick={handleClick}
        >
          {isWatching ? "Stop" : "Watch"}
        </Button>
      </div>
    </section>
  );
};

export default Watch;
