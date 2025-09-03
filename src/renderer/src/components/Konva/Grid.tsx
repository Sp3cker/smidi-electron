import { getCssVariable } from "@renderer/utils";
import type { Stage } from "konva/lib/Stage";
import { useMemo } from "react";
import { Group, Line, Text } from "react-konva";

// Grid calculations
const BEATS_PER_MEASURE = 4; // 4/4 time
const MEASURES_PER_GRID_CELL = 1;
const BEATS_PER_GRID_CELL = BEATS_PER_MEASURE * MEASURES_PER_GRID_CELL; // 4 beats per grid cell

export const GridLines = ({
  totalBeats,
  widthPerBeat,
  stageRef,
}: {
  totalBeats: number;
  widthPerBeat: number;
  stageRef: React.RefObject<Stage | null>;
}) => {
  const height = stageRef.current?.height() ?? 0;
  const GridCells = useMemo(() => {
    const numCells = Math.ceil(totalBeats / BEATS_PER_GRID_CELL);
    return Array.from({ length: numCells + 1 }, (_, i) => {
      const x = i * BEATS_PER_GRID_CELL * widthPerBeat;
      return (
        <Line
          points={[x, 0, x, height]}
          stroke={getCssVariable("--color-neir")}
          strokeWidth={4}
          key={i}
        />
      );
    });
  }, [totalBeats, widthPerBeat, height]);
  return <Group>{GridCells}</Group>;
};

export const GridLabels = ({
  totalBeats,
  widthPerBeat,
}: {
  totalBeats: number;
  widthPerBeat: number;
}) => {
  const numCells = Math.floor(totalBeats / BEATS_PER_GRID_CELL);
  const GridLabels = useMemo(() => {
    return Array.from({ length: numCells }, (_, i) => {
      const x = i * BEATS_PER_GRID_CELL * widthPerBeat;
      return (
        <Text
          x={x}
          y={0}
          text={i.toString()}
          key={i}
          fontSize={12}
          fontFamily="NBit"
          color={getCssVariable("--yatsugi-grey-3")}
          listening={false}
        />
      );
    });
  }, [widthPerBeat, numCells]);
  return <Group>{GridLabels}</Group>;
};

/**
 * Measure-based grid component that calculates grid lines based on musical measures
 */
export const MeasureGrid = ({
  totalMeasures,
  pixelsPerBeat,
  stageRef,
  showMeasureLabels = true,
}: {
  totalMeasures: number;
  pixelsPerBeat: number;
  stageRef: React.RefObject<Stage | null>;
  showMeasureLabels?: boolean;
}) => {
  const height = stageRef.current?.height() ?? 0;
  const pixelsPerMeasure = pixelsPerBeat * BEATS_PER_MEASURE;

  const gridLines = useMemo(() => {
    const numMeasures = Math.ceil(totalMeasures);
    return Array.from({ length: numMeasures + 1 }, (_, i) => {
      const x = i * pixelsPerMeasure;
      return (
        <Line
          points={[x, 0, x, height]}
          stroke={getCssVariable("--color-neir")}
          strokeWidth={4}
          key={`measure-${i}`}
        />
      );
    });
  }, [totalMeasures, pixelsPerMeasure, height]);

  const measureLabels = useMemo(() => {
    if (!showMeasureLabels) return null;

    const numMeasures = Math.floor(totalMeasures);
    return Array.from({ length: numMeasures }, (_, i) => {
      const x = i * pixelsPerMeasure + 4; // Small offset from the line
      return (
        <Text
          x={x}
          y={4}
          text={`${i + 1}`}
          key={`label-${i}`}
          fontSize={12}
          fontFamily="NBit"
          color={getCssVariable("--yatsugi-grey-3")}
          listening={false}
        />
      );
    });
  }, [totalMeasures, pixelsPerMeasure, showMeasureLabels]);

  return (
    <Group>
      {gridLines}
      {measureLabels}
    </Group>
  );
};
