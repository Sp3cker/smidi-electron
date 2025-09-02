import { Rect } from "react-konva";
import { getCssVariable } from "../../utils";
export const LeftEdge = ({ height }: { height: number }) => {
  return (
    <Rect
      x={0}
      y={0}
      width={20}
      height={height}
      fill={getCssVariable("--yatsugi-blue-600")}
      stroke={getCssVariable("--yatsugi-blue-600")}
      strokeWidth={2}
      onMouseOver={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "move";
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
    />
  );
};

export const RightEdge = ({
  height,
  endPosition,
}: {
  height: number;
  endPosition: number;
}) => {
  return (
    <Rect
      x={endPosition}
      y={0}
      width={20}
      height={height}
      fill={getCssVariable("--yatsugi-blue-600")}
      stroke={getCssVariable("--yatsugi-blue-600")}
      strokeWidth={2}
      onMouseOver={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "move";
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
    />
  );
};
