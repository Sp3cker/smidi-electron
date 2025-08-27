import React from "react";
import { Input } from "../../ui/Input";
import { useWatchStore } from "../../store";
import { Button } from "../../ui/Button";

const Watch: React.FC = () => {
  const { directory, setDirectory, promptDirectory, isWatching, startWatch } = useWatchStore();

  const handleClick = () => {
    startWatch();
  };
  return (
    <section>
      <div className="flex flex-row gap-2">
        <Input
          label="Directory to watch"
          value={directory ?? ""}
          onChange={(e) => setDirectory(e.target.value)}
        />
        <Button onClick={promptDirectory}>Browse</Button>
      </div>
      <Button
        variant={isWatching ? "secondary" : "primary"}
        onClick={handleClick}
      >
        {isWatching ? "Stop" : "Watch"}
      </Button>
    </section>
  );
};

export default Watch;
