import useWatchStore from "../../store/watchStore";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import { Text, Group, Layer, Line, Rect, Stage } from "react-konva";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MeasureGrid } from "../Konva/Grid";
import { NoteSegment, ParsedMidiTrack } from "@shared/dto";
import { white2 } from "@renderer/ui";
import { useMeasureCalculation } from "../../hooks/useMeasureCalculation";

import { useSpring, animated } from "@react-spring/konva";
import { KonvaEventObject } from "konva/lib/Node";
import { clamp } from "motion";
import MidiStage from "./MidiStage";

const AnimatedStage = animated(Stage);
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
  ticksPerMeasure,
  pixelsPerMeasure,
}: {
  note: NoteSegment;
  height: number;
  noteToY: (midi: number) => number;
  ticksPerMeasure: number;
  pixelsPerMeasure: number;
}) => {
  const xPosStart =
    (note.offsetTicksInBar / ticksPerMeasure) * pixelsPerMeasure;
  const xPosEnd =
    ((note.offsetTicksInBar + note.durationTicksInBar) / ticksPerMeasure) *
    pixelsPerMeasure;
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
  ticksPerMeasure,
  pixelsPerMeasure,
}: {
  measure: NoteSegment[];
  order: number;
  noteHeight: number;
  noteToY: (midi: number) => number;
  ticksPerMeasure: number;
  pixelsPerMeasure: number;
}) => {
  const measureXPosition = order * pixelsPerMeasure;

  // Need to set X and Y of Group so Midi note knows correct vertical and horizontal position
  return (
    <Group x={measureXPosition} width={pixelsPerMeasure} height={96}>
      <Rect
        width={pixelsPerMeasure}
        x={0}
        height={96}
        // fill="rgba(80,160,255,0.25)"
        borderRadius={4}
        stroke={white2}
        strokeWidth={0.5}
      ></Rect>

      {measure.map((qtrNote, i) => {
        if (qtrNote) {
          return (
            <MidiNote
              note={qtrNote}
              key={qtrNote.name + i}
              height={noteHeight}
              noteToY={noteToY}
              ticksPerMeasure={ticksPerMeasure}
              pixelsPerMeasure={pixelsPerMeasure}
            />
          );
        }
        return null;
      })}
    </Group>
  );
};

const MidiTrack = ({
  midiTrack,
  y,
  pixelsPerMeasure,
}: {
  midiTrack: ParsedMidiTrack;
  y: number;
  pixelsPerMeasure: number;
}) => {
  const { highest: highestNoteInMidi, lowest: lowestNoteInMidi } =
    midiTrack.pitchRange;
  const ticksPerMeasure = midiTrack.ticksPerMeasure;

  // Height of a track is actually static.
  // However, this is the best place to determine the vertical scale of the notes
  // from the delta between the highest and lowest note in the list of measures
  const minVerticalNotes = 8;
  const verticalRange = Math.max(
    minVerticalNotes,
    highestNoteInMidi - lowestNoteInMidi
  );
  const noteHeightAtMinVerticalNotes = 64;
  const scaledHeight = noteHeightAtMinVerticalNotes / verticalRange;
  const measureBlocks = useMemo(() => {
    const blocks: {
      id: string;
      startMeasure: number; // measure index where the block begins
      measures: NoteSegment[][];
    }[] = [];
    let current: (typeof blocks)[number] | null = null;
    let lastMeasureIndex = -1;
    midiTrack.measures.forEach(({ index, segments }) => {
      if (!current) {
        current = {
          id: `${midiTrack.trackName}-${index}`,
          startMeasure: index,
          measures: [segments],
        };
        lastMeasureIndex = index;
        return;
      }

      if (index === lastMeasureIndex + 1) {
        current.measures.push(segments);
      } else {
        blocks.push(current);
        current = {
          id: `${midiTrack.trackName}-${index}`,
          startMeasure: index,
          measures: [segments],
        };
      }
      lastMeasureIndex = index;
    });

    if (current) blocks.push(current);
    return blocks;
  }, [midiTrack.trackName, midiTrack.measures]);

  // Map MIDI pitch to Y so that lower pitches appear lower on screen
  // (Konva Y grows downward). Highest pitch -> y = 0, lowest -> max.
  const noteToY = (midi: number) => (highestNoteInMidi - midi) * scaledHeight;

  // For every octave between the highest and lowest note, we make midi notes 1/2 as big.
  return (
    <Group y={y}>
      <Text
        text={midiTrack.trackName}
        zIndex={1000}
        fontSize={14}
        fontWeight="bold"
        fontFamily="Neuebit"
      />
      {measureBlocks.map((block) => (
        <Group key={block.id} x={block.startMeasure * pixelsPerMeasure}>
          <Rect
            width={block.measures.length * pixelsPerMeasure}
            height={96}
            fill="#0396A2"
            cornerRadius={4}
            // stroke={white2}
            // strokeWidth={1}
            opacity={0.5}
          />

          {block.measures.map((measure, idx) => (
            <MidiMeasure
              key={`${block.id}-${idx}`}
              measure={measure}
              order={idx}
              ticksPerMeasure={ticksPerMeasure}
              pixelsPerMeasure={pixelsPerMeasure}
              noteHeight={scaledHeight}
              noteToY={noteToY}
            />
          ))}
        </Group>
      ))}
    </Group>
  );
};
const MidiList = ({ midiFiles }: { midiFiles: ParsedMidiTrack[] }) => {
  const [totalMeasures, setTotalMeasures] = useState(0);

  // Get the parent container width

  // const { midiFiles } = useTrackLayout(parentWidth);
  // Calculate measures that fit on screen
  const measureCalculation = useMeasureCalculation(800, totalMeasures, {
    minPixelsPerBeat: 10,
    maxPixelsPerBeat: 32,
    pixelsPerMeasure: 500,
  });
  const pixelsPerMeasure = measureCalculation.pixelsPerBeat * 4;



  useEffect(() => {
    if (midiFiles.length > 0) {
      const longestClip = midiFiles.reduce((max, midi) => {
        const totalMeasures = midi.lastMeasureIndex + 1;
        return Math.max(max, totalMeasures);
      }, 0);

      // Convert beats to measures (assuming 4/4 time)
      setTotalMeasures(Math.ceil(longestClip));
    } else {
      setTotalMeasures(0);
    }
  }, [midiFiles]);
  return (
    <MidiStage>
      <Layer>
        <MeasureGrid
          totalMeasures={totalMeasures}
          pixelsPerBeat={measureCalculation.pixelsPerBeat}
          height={midiFiles.length * 128 + 40}
          showMeasureLabels={true}
        />

        {midiFiles.map((midi, index) => (
          <MidiTrack
            key={midi.trackName}
            y={96 * index + 20}
            midiTrack={midi}
            pixelsPerMeasure={pixelsPerMeasure}
          />
        ))}
      </Layer>
    </MidiStage>
  );
};

const List = () => {
  const { midiFiles } = useWatchStore();
  return (
    <div className="min-h-screen bg-[var(--white-rock)]">
      <div className="max-w-6xl mx-auto">
        {midiFiles.length > 0 ? (
          <MidiList midiFiles={midiFiles} />
        ) : (
          <div className="text-center text-[var(--tallow)] py-12 px-4 bg-gray-50 border-2 border-gray-200 border-dashed rounded-lg">
            <div className=" text-lg font-medium">No MIDI files loaded</div>
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
