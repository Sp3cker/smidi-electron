import { useMemo } from "react";
import type { Stage } from "konva/lib/Stage";
import { getCssVariable } from "@renderer/utils";

// Grid calculations
const BEATS_PER_MEASURE = 4; // 4/4 time
const MEASURES_PER_GRID_CELL = 1;
const BEATS_PER_GRID_CELL = BEATS_PER_MEASURE * MEASURES_PER_GRID_CELL;

export const GridLines = ({
  totalBeats,
  widthPerBeat,
  stageRef,
}: {
  totalBeats: number;
  widthPerBeat: number;
  stageRef: React.RefObject<Stage>;
}) => {
  const computedHeight = stageRef.current?.height?.() ?? 0;
  const gridCells = useMemo(() => {
    const numCells = Math.ceil(totalBeats / BEATS_PER_GRID_CELL);
    return Array.from({ length: numCells + 1 }, (_, i) => {
      const x = i * BEATS_PER_GRID_CELL * widthPerBeat;
      return (
        <line
          x1={x}
          y1={0}
          x2={x}
          y2={computedHeight}
          stroke={getCssVariable("--color-neir")}
          strokeWidth={4}
          key={i}
        />
      );
    });
  }, [totalBeats, widthPerBeat, computedHeight]);

  return <g>{gridCells}</g>;
};

export const GridLabels = ({
  totalBeats,
  widthPerBeat,
}: {
  totalBeats: number;
  widthPerBeat: number;
}) => {
  const labels = useMemo(() => {
    const numCells = Math.floor(totalBeats / BEATS_PER_GRID_CELL);
    return Array.from({ length: numCells }, (_, i) => {
      const x = i * BEATS_PER_GRID_CELL * widthPerBeat;
      return (
        <text
          x={x}
          y={12}
          key={i}
          fontSize={12}
          fontFamily="NBit"
          fill={getCssVariable("--yatsugi-grey-3")}
        >
          {i}
        </text>
      );
    });
  }, [totalBeats, widthPerBeat]);

  return <g>{labels}</g>;
};
