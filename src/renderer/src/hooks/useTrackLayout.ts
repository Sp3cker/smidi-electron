import { watchStore } from "@renderer/store";
import { useMeasureCalculation, useParentWidth } from "./useMeasureCalculation";
const useTrackLayout = (parentWidth: number) => {
  const midiFiles = watchStore((state) => state.midiFiles);

  const midiMeasureSize = useMeasureCalculation(parentWidth, totalMeasures, {
    minPixelsPerBeat: 1,
    maxPixelsPerBeat: 32,
    pixelsPerMeasure: 1000,
  });

  return { midiFiles, midiMeasureSize };
};

export default useTrackLayout;
