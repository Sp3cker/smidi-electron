import useWatchStore from "../../store/watchStore";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import { Text, Group, Layer, Line, Rect, Stage } from "react-konva";
import { useEffect, useMemo, useRef, useState } from "react";
import { MeasureGrid } from "../Konva/Grid";
import { NoteSegment, ParsedMidiMeasures } from "@shared/dto";
import { grey1, white2 } from "@renderer/ui";
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
    <Group width={pixelsPerMeasure} height={96}>
      <Rect
        width={pixelsPerMeasure}
        height={96}
        x={measureXPosition}
        // fill="rgba(80,160,255,0.25)"
        borderRadius={4}
        stroke={white2}
        strokeWidth={0.5}></Rect>
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
// const MidiGroup = ({ measures }: { measures: NoteSegment[] }) => {
//   const blocks = useMemo(() => {
//     const out: { start: number; end: number; measures: NoteSegment[] }[] = [];
//     let current: (typeof out)[number] | null = null;

//     measures.forEach((m: NoteSegment) => {
//       const hasData = m.events.length > 0;
//       if (hasData) {
//         if (!current)
//           current = { start: m.x, end: m.x + m.width, measures: [m] };
//         else {
//           current.end = m.x + m.width;
//           current.measures.push(m);
//         }
//       } else if (current) {
//         out.push(current);
//         current = null;
//       }
//     });
//     if (current) out.push(current);
//     return out;
//   }, [measures]);

//   return (
//     <Group>
//       {blocks.map((block) => (
//         <Group key={block.start}>
//           <Rect
//             x={block.start - 4}
//             y={trackTop}
//             width={block.end - block.start + 8}
//             height={96}
//             fill="rgba(80,160,255,0.25)"
//             cornerRadius={6}
//             listening={false}
//           />
//           {block.measures.map((m) => (
//             <MidiMeasure key={m.id} measure={m} />
//           ))}
//         </Group>
//       ))}
//     </Group>
//   );
// };
const MidiTrack = ({
  midiTrack,
  pixelsPerMeasure,
}: {
  midiTrack: ParsedMidiMeasures;
  pixelsPerMeasure: number;
}) => {
  // Height of a track is actually static.
  // However, this is the best place to determine the vertical scale of the notes
  // from the delta between the highest and lowest note in the list of measures
  const { highestNoteInMidi, lowestNoteInMidi } = midiTrack;
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
      startIndex: number;
      measures: NoteSegment[][];
    }[] = [];
    let current: (typeof blocks)[number] | null = null;

    midiTrack.measures.forEach((measure, index) => {
      const hasNotes = Array.isArray(measure) && measure.some(Boolean);
      if (hasNotes === false) {
        if (current) {
          blocks.push(current);
          current = null;
        }
        return;
      }

      if (!current) {
        current = {
          id: `${midiTrack.fileName}-${index}`,
          startIndex: index,
          measures: [measure],
        };
      } else {
        current.measures.push(measure);
      }
    });

    if (current) blocks.push(current);
    return blocks;
  }, [midiTrack.fileName, midiTrack.measures]);

  // Map MIDI pitch to Y so that lower pitches appear lower on screen
  // (Konva Y grows downward). Highest pitch -> y = 0, lowest -> max.
  const noteToY = (midi: number) => (highestNoteInMidi - midi) * scaledHeight;
  debugger
  // For every octave between the highest and lowest note, we make midi notes 1/2 as big.
  return (
    <Group >
      <Text
        text={midiTrack.fileName}
        zIndex={1000}
        fontSize={14}
        fontWeight="bold"
        fontFamily="Neuebit"
      />
      {measureBlocks.map((block, i) => (
        <Group key={block.id} x={block.startIndex * pixelsPerMeasure}>
          {/* <Rect
            width={block.measures.length * pixelsPerMeasure}
            height={96}
            fill="#0396A2"
            cornerRadius={4}
            stroke={white2}
            strokeWidth={1}
          /> */}

          {block.measures.map((measure, idx) => (
            <MidiMeasure
              key={`${block.id}-${idx}`}
              measure={measure}
              order={idx}
              ticksPerBar={midiTrack.ticksPerBar}
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
      <Stage
        width={parentWidth || window.innerWidth}
        height={window.innerHeight}
        ref={stageRef}>
        <Layer>
          <MeasureGrid
            totalMeasures={totalMeasures}
            pixelsPerBeat={measureCalculation.pixelsPerBeat}
            stageRef={stageRef}
            showMeasureLabels={true}
          />

          {midiFiles.map((midi, index) => (
            <Group key={midi.fileName} y={rowTop(index) + 20}>
              <MidiTrack midiTrack={midi} pixelsPerMeasure={pixelsPerMeasure} />
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
