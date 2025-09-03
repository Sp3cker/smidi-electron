import useWatchStore from "../../store/watchStore";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import { Text, Group, Layer, Line, Rect, Stage } from "react-konva";
import { useEffect, useRef, useState } from "react";
import { MeasureGrid } from "../Konva/Grid";
import { NoteSegment, ParsedMidiMeasures } from "@shared/dto";
import { grey1 } from "@renderer/ui";
import {
  useMeasureCalculation,
  useParentWidth,
} from "../../hooks/useMeasureCalculation";

const getRootFontSize = () =>
  parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

export const ticksToRem_Q = (ticks: number, ppq: number, remPerQuarter = 1) =>
  (ticks / ppq) * remPerQuarter;

export const ticksToPx_Q = (ticks: number, ppq: number) =>
  ticksToRem_Q(ticks, ppq, 1) * getRootFontSize();

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

const MidiNote = ({
  note,
  height,
  noteToY,
  ticksPerBar,
  pixelsPerMeasure,
}: {
  note: NoteSegment;
  height: number;
  noteToY: (midi: number) => number;
  ticksPerBar: number;
  pixelsPerMeasure: number;
}) => {
  const xPosStart = (note.startTick / ticksPerBar) * pixelsPerMeasure;
  const xPosEnd = (note.endTick / ticksPerBar) * pixelsPerMeasure;
  return (
    <Line
      points={[xPosStart, noteToY(note.midi), xPosEnd, noteToY(note.midi)]}
      stroke="black"
      strokeWidth={height}
    />
  );
};
const MidiMeasure = ({
  measure,
  order,
  noteHeight,
  noteToY,
  ticksPerBar,
  pixelsPerMeasure,
}: {
  measure: NoteSegment[];
  order: number;
  noteHeight: number;
  noteToY: (midi: number) => number;
  ticksPerBar: number;
  pixelsPerMeasure: number;
}) => {
  const measureXPosition = order * pixelsPerMeasure;
  // Need to set X and Y of Group so Midi note knows correct vertical and horizontal position
  return (
    <Group>
      <Rect
        width={pixelsPerMeasure}
        height={96}
        borderRadius={4}
        x={measureXPosition}
        stroke={grey1}
        strokeWidth={1}
      ></Rect>
      <Group>
        {measure.map((qtrNote, i) => {
          if (qtrNote) {
            return (
              <MidiNote
                note={qtrNote}
                key={qtrNote.name + i}
                height={noteHeight}
                noteToY={noteToY}
                ticksPerBar={ticksPerBar}
                pixelsPerMeasure={pixelsPerMeasure}
              />
            );
          }
          return <Line key={i} points={[0, 0, 0, 96]} />;
        })}
      </Group>
    </Group>
  );
};
const MidiTrack = ({
  midiFile,
  pixelsPerMeasure,
}: {
  midiFile: ParsedMidiMeasures;
  pixelsPerMeasure: number;
}) => {
  // Height of a track is actually static.
  // However, this is the best place to determine the vertical scale of the notes
  // from the delta between the highest and lowest note in the list of measures
  const { highestNoteInMidi, lowestNoteInMidi } = midiFile;
  const minVerticalNotes = 8;
  const verticalRange = Math.max(
    minVerticalNotes,
    highestNoteInMidi - lowestNoteInMidi
  );
  const noteHeightAtMinVerticalNotes = 64;
  const scaledHeight = noteHeightAtMinVerticalNotes / verticalRange;

  // Map MIDI pitch to Y so that lower pitches appear lower on screen
  // (Konva Y grows downward). Highest pitch -> y = 0, lowest -> max.
  const noteToY = (midi: number) => (highestNoteInMidi - midi) * scaledHeight;

  // For every octave between the highest and lowest note, we make midi notes 1/2 as big.
  return (
    <Group>
      <Text text={midiFile.fileName} />
      {midiFile.measures.map((measure, i) => {
        if (measure !== undefined) {
          return (
            <MidiMeasure
              measure={measure}
              order={i}
              key={i}
              ticksPerBar={midiFile.ticksPerBar}
              pixelsPerMeasure={pixelsPerMeasure}
              noteHeight={scaledHeight}
              noteToY={noteToY}
            />
          );
        } else {
          return (
            <Rect
              width={pixelsPerMeasure}
              height={96}
              x={i * pixelsPerMeasure}
              stroke={grey1}
              strokeWidth={1}
              key={i}
            />
          );
        }
      })}
    </Group>
  );
};
const MidiList = ({ midiFiles }: { midiFiles: ParsedMidiMeasures[] }) => {
  const [totalMeasures, setTotalMeasures] = useState(0);

  const rowHeight = 96; // visual row height for the list in rem
  const rowGap = pxToRem(30);

  const stageRef = useRef<KonvaStage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get the parent container width
  const parentWidth = useParentWidth(
    containerRef as React.RefObject<HTMLElement>
  );

  // Calculate measures that fit on screen
  const measureCalculation = useMeasureCalculation(parentWidth, totalMeasures, {
    minPixelsPerBeat: 1,
    maxPixelsPerBeat: 32,
    pixelsPerMeasure: 1000,
  });
  const pixelsPerMeasure = measureCalculation.pixelsPerBeat * 4;

  const rowTop = (rowIndex: number) => rowIndex * (rowHeight + rowGap);

  useEffect(() => {
    if (midiFiles.length > 0) {
      const longestClip = midiFiles.reduce((max, midi) => {
        return Math.max(max, midi.measures.length);
      }, 0);

      // Convert beats to measures (assuming 4/4 time)
      setTotalMeasures(Math.ceil(longestClip));
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
          <MeasureGrid
            totalMeasures={totalMeasures}
            pixelsPerBeat={measureCalculation.pixelsPerBeat}
            stageRef={stageRef}
            showMeasureLabels={true}
          />

          {midiFiles.map((midi, index) => (
            <Group key={midi.fileName} y={rowTop(index) + 20}>
              <MidiTrack midiFile={midi} pixelsPerMeasure={pixelsPerMeasure} />
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
    <div className="min-h-screen bg-[var(--white-rock)] p-6">
      <div className="max-w-6xl mx-auto">
        {midiFiles.length > 0 ? (
          <MidiList midiFiles={midiFiles} />
        ) : (
          <div className="text-center text-[var(--tallow)] py-12 px-4 bg-gray-50 border-2 border-gray-200 border-dashed rounded-lg">
            <div className=" text-lg font-medium">
              No MIDI files loaded
            </div>
            <div className=" text-sm mt-2">
              Load some MIDI files to see the piano roll visualization
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default List;
