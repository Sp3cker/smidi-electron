import { Button } from "@renderer/ui";

const ConfigReset = ({ onReset }: { onReset: () => void }) => {
  return <Button onClick={onReset}>Reset Config</Button>;
};

export default ConfigReset;
