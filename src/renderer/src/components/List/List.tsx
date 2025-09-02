import useWatchStore from "../../store/watchStore";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import type { MidiFile } from "@shared/MidiFile";
import MidiClipKonva from "../Konva/MidiClipKonva";
import { Group, Layer, Stage } from "react-konva";
import { useEffect, useRef, useState } from "react";
import { MeasureGrid, BeatGrid } from "../Konva/Grid";
import {
  useMeasureCalculation,
  useParentWidth,
} from "../../hooks/useMeasureCalculation";

/**
 * Convert pixels to rem values based on the root font size
 * @param pixels - The pixel value to convert
 * @returns The equivalent value in rem units
 */
const pxToRem = (pixels: number): number => {
  // Get the root font size, defaulting to 16px if not available
  const rootFontSize =
    parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return pixels / rootFontSize;
};

const MidiList = ({ midiFiles }: { midiFiles: MidiFile[] }) => {
  const [totalBeats, setTotalBeats] = useState(0);
  const [totalMeasures, setTotalMeasures] = useState(0);
  const bpm = 120;
  const rowHeight = pxToRem(300); // visual row height for the list in rem
  const rowGap = pxToRem(30);

  const stageRef = useRef<KonvaStage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get the parent container width
  const parentWidth = useParentWidth(
    containerRef as React.RefObject<HTMLElement>,
  );

  // Calculate measures that fit on screen
  const measureCalculation = useMeasureCalculation(parentWidth, totalMeasures, {
    minPixelsPerBeat: 8,
    maxPixelsPerBeat: 32,
  });

  const beatsToX = (beats: number) => beats * measureCalculation.pixelsPerBeat;
  const rowTop = (rowIndex: number) => rowIndex * (rowHeight + rowGap);

  useEffect(() => {
    if (midiFiles.length > 0) {
      const longestClip = midiFiles.reduce((max, midi) => {
        return Math.max(max, midi.duration);
      }, 0);
      setTotalBeats(longestClip);
      // Convert beats to measures (assuming 4/4 time)
      setTotalMeasures(Math.ceil(longestClip / 4));
    }
  }, [midiFiles]);
  return (
    <div ref={containerRef} className="space-y-6">
      {/* Debug info */}
      <div className="text-sm text-gray-600 p-2 bg-gray-100 rounded">
        <div>Parent Width: {parentWidth}px</div>
        <div>Measures on Screen: {measureCalculation.measuresOnScreen}</div>
        <div>
          Pixels per Beat: {measureCalculation.pixelsPerBeat.toFixed(1)}
        </div>
        <div>Total Measures: {totalMeasures}</div>
        <div>
          Constrained: {measureCalculation.isConstrained ? "Yes" : "No"}
        </div>
      </div>

      <Stage
        width={parentWidth || window.innerWidth}
        height={window.innerHeight}
        ref={stageRef}
      >
        <Layer>
          {/* Measure-based grid */}
          <MeasureGrid
            totalMeasures={totalMeasures}
            pixelsPerBeat={measureCalculation.pixelsPerBeat}
            stageRef={stageRef}
            showMeasureLabels={true}
          />

          {/* Optional: Beat grid for finer granularity */}
          {/* <BeatGrid
            totalBeats={totalBeats}
            pixelsPerBeat={measureCalculation.pixelsPerBeat}
            stageRef={stageRef}
            showBeatLabels={false}
          /> */}

          {midiFiles.map((midi, index) => (
            <Group key={midi.fileName} y={rowTop(index) + 20}>
              <MidiClipKonva
                height={rowHeight}
                fileName={midi.fileName}
                notes={midi.tracks[0].notes}
                bpm={bpm}
                x={beatsToX(midi.tracks[0].notes[0]?.time || 0)}
                y={rowTop(index)}
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

const List = () => {
  const { midiFiles } = useWatchStore();
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {midiFiles.length > 0 ? (
          <MidiList midiFiles={midiFiles} />
        ) : (
          <div className="text-center py-12 px-4 bg-gray-50 border-2 border-gray-200 border-dashed rounded-lg">
            <div className="text-gray-400 text-lg font-medium">
              No MIDI files loaded
            </div>
            <div className="text-gray-300 text-sm mt-2">
              Load some MIDI files to see the piano roll visualization
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default List;
