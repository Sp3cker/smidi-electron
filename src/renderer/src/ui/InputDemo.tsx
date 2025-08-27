import React, { useState } from "react";
import { Input } from "./Input";

const InputDemo: React.FC = () => {
  const [defaultValue, setDefaultValue] = useState("");
  const [errorValue, setErrorValue] = useState("");

  return (
    <div className="p-6 space-y-8 bg-zinc-800 min-h-screen">
      <div className="max-w-md space-y-6">
        <Input
          label="Directory to watch"
          placeholder="Type something here..."
          value={defaultValue}
          onChange={(e) => setDefaultValue(e.target.value)}
        />
      </div>
    </div>
  );
};

export default InputDemo;
