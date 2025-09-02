import React, { useRef } from "react";
import { Group, Rect, Line, Text } from "react-konva";
import type { Group as KonvaGroup } from "konva";
import { LeftEdge, RightEdge } from "./DragEdges";
import { Spring } from "@react-spring/konva";
import { getCssVariable } from "@renderer/utils";
export type MidiNoteLike = {
  midi: number;
  time: number; // seconds
  duration: number; // seconds
  velocity?: number;
};

export interface MidiClipKonvaProps {
  x?: number;
  y?: number;
  width?: number; // optional explicit clip width (px); if provided, beats scale to fit
  height: number; // optional explicit clip height (px) including header and padding
  fileName: string;
  notes: MidiNoteLike[];
  bpm: number; // beats per minute
  pixelsPerBeat?: number; // horizontal zoom
  headerHeight?: number; // px
  padding?: number; // px
  clipColor?: string;
  headerColor?: string;
  borderColor?: string;
  noteColor?: string;
}

/**
 * A single MIDI clip drawn as a Konva Group, similar to an Ableton clip.
 * - No horizontal grid lines.
 * - A small bar at the top for the file name.
 * - Notes rendered as thin horizontal lines positioned by pitch and time.
 *
 * The component positions its content starting at (x, y) and sizes itself to
 * the content (based on last note end and pitch range).
 */
const MidiClipKonva: React.FC<MidiClipKonvaProps> = ({
  x = 0,
  y = 0,
  width,
  height,
  fileName,
  notes,
  bpm,
  pixelsPerBeat = 40,
  headerHeight = 16,
  padding = 6,
  clipColor = getCssVariable("--color-neir-lightest"),
  headerColor = getCssVariable("--color-neir-lighter"),
  borderColor = "#2d3748",
  noteColor = "#2563eb",
}) => {
  // Derive beats-based horizontal domain
  const toBeats = (seconds: number) => (seconds * bpm) / 60;

  const lastEndBeats = notes.length
    ? Math.max(...notes.map((n) => toBeats(n.time + n.duration)))
    : 0;
  const contentBeats = Math.max(0, Math.ceil(lastEndBeats * 1000) / 1000);
  const innerWidth =
    typeof width === "number" ? Math.max(1, width - padding * 2) : undefined;
  const effectivePixelsPerBeat = innerWidth
    ? innerWidth / Math.max(contentBeats, 0.000001)
    : pixelsPerBeat;
  const beatsToX = (beats: number) => padding + beats * effectivePixelsPerBeat;
  const contentWidth = innerWidth ?? contentBeats * effectivePixelsPerBeat;

  // Force exact height: always use the height you specify
  const clipHeight = height; // default to 6.25rem (100px at 16px root font) if not specified
  const innerHeight = Math.max(1, clipHeight - headerHeight - padding * 2);

  // Get the pitch range from your notes
  const midis = notes.map((n) => n.midi);
  const maxMidi = midis.length ? Math.max(...midis) : 72;
  const minMidi = midis.length ? Math.min(...midis) : 60;
  const pitchRange = Math.max(1, maxMidi - minMidi + 1);

  // Force each row to be exactly innerHeight/pitchRange pixels tall
  // This will make rows very thin if you have many octaves, but notes will fit
  const rowHeight = Math.max(1, Math.floor(innerHeight / pitchRange));

  const clipWidth = width ?? Math.max(1, contentWidth + padding * 2);

  // Make note lines thin so they fit in the squished rows
  const strokeWidth = Math.max(1, Math.min(2, rowHeight - 1));

  const midiToY = (midi: number) => {
    const rowIndex = maxMidi - midi; // top row is highest midi
    return padding + headerHeight + rowIndex * rowHeight;
  };

  const groupRef = useRef<KonvaGroup>(null);

  const handleClick = () => {
    console.log("clicked");
  };
  return (
    <Group
      onClick={handleClick}
      fill="red"
      x={x}
      y={y}
      width={clipWidth}
      height={clipHeight}
      ref={groupRef}
    >
      {/* Clip background and border */}
      <LeftEdge height={clipHeight + headerHeight} />
      <RightEdge height={clipHeight + headerHeight} endPosition={clipWidth} />
      <Rect
        x={0}
        y={0}
        width={clipWidth}
        height={clipHeight + 100}
        fill={clipColor}
        stroke={borderColor}
        strokeWidth={1}
        cornerRadius={4}
      />

      {/* Header bar */}
      <Rect
        x={0}
        y={0}
        width={clipWidth}
        height={headerHeight}
        fill={headerColor}
        shadowColor={"rgba(0,0,0,0.08)"}
        shadowBlur={0}
        shadowOffset={{ x: 0, y: 1 }}
        shadowOpacity={1}
        cornerRadius={[4, 4, 0, 0]}
      />
      <Text
        x={padding}
        y={Math.max(0, (headerHeight - 12) / 2)}
        text={fileName}
        fontSize={12}
        fontFamily="Mondwest"
        fill="#1a202c"
        listening={false}
      />
      {/* Selected clip border */}

      {/* Notes as lines */}
      {notes.map((n, idx) => {
        const startBeats = toBeats(n.time);
        const endBeats = toBeats(n.time + n.duration);
        const x1 = beatsToX(startBeats);
        const x2 = beatsToX(endBeats);
        const yLine = midiToY(n.midi) + strokeWidth / 2;

        return (
          <Line
            key={idx}
            points={[x1, yLine, x2, yLine]}
            stroke={noteColor}
            strokeWidth={strokeWidth}
            lineCap="round"
            listening={false}
          />
        );
      })}
    </Group>
  );
};

export default MidiClipKonva;
