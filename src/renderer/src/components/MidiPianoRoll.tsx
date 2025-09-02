import type { MidiFile } from "@shared/MidiFile";
import { Note } from "@tonejs/midi/dist/Note";
import { motion } from "motion/react";
const MidiNote = ({
  note,
  timeToX,
  noteToY,
  bpm,
  noteHeight,
}: {
  note: Note;
  timeToX: (beats: number) => number;
  noteToY: (midiNote: number) => number;
  bpm: number;
  noteHeight: number;
}) => {
  const startBeats = (note.time * bpm) / 60;
  const durationBeats = (note.duration * bpm) / 60;

  const x = timeToX(startBeats);
  const y = noteToY(note.midi);
  const width = Math.max(timeToX(durationBeats), 2);

  return (
    <div
      className="absolute bg-[var(--yatsugi-blue-700)]"
      style={{
        left: x,
        top: y,
        width,
        height: noteHeight,
        opacity: note.velocity * 0.8 + 0.2,
      }}
      title={`${note.name} (${note.midi})`}
    />
  );
};
const VerticalBars = ({
  count,
  timeToX,
  withLabels = false,
}: {
  count: number;
  timeToX: (time: number) => number;
  withLabels?: boolean;
}) => {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const x = timeToX(i);
        return (
          <div
            key={`time-${i}`}
            className="absolute h-full border-l border-[var(--yatsugi-white)]"
            style={{ left: x }}
          >
            {withLabels ? (
              <span className="absolute -top-6 left-0 text-xs text-[var(--yatsugi-grey-3)] transform -translate-x-1/2">
                {i}s
              </span>
            ) : null}
          </div>
        );
      })}
    </>
  );
};

const HorizontalBars = ({
  positions,
  className = "border-[var(--yatsugi-white-2)]",
  opacity = 1,
}: {
  positions: number[];
  className?: string;
  opacity?: number;
}) => {
  return (
    <>
      {positions.map((y, idx) => (
        <div
          key={`h-${idx}`}
          className={`absolute w-full border-t ${className}`}
          style={{ top: y, opacity }}
        />
      ))}
    </>
  );
};
const MidiPianoRoll = ({ midiFile }: { midiFile: MidiFile }) => {
  // Get the first track (assuming one track per MIDI file as user specified)
  const track = midiFile.tracks[0];
  if (!track) return null;

  const totalDuration = midiFile.duration;
  const ccRollHeight = 50; // Height for CC piano roll

  // DAW-style timeline: fixed width with scrollable content
  const timelineWidth = 1200; // Fixed timeline width like DAWs
  // Beats-based horizontal domain
  const header =
    (
      midiFile as unknown as {
        header?: {
          ppq?: number;
          tempos?: { bpm: number }[];
          timeSignatures?: { timeSignature: [number, number] }[];
        };
      }
    ).header ?? {};
  const bpm: number =
    header.tempos && header.tempos[0] ? header.tempos[0].bpm : 120;
  const firstTs =
    header.timeSignatures && header.timeSignatures[0]
      ? header.timeSignatures[0]
      : undefined;
  const ts: [number, number] = firstTs?.timeSignature ?? [4, 4];
  const beatsPerBar = ts[0] * (4 / ts[1]);
  const pixelsPerBeat = 40;
  const timeToX = (beats: number) => beats * pixelsPerBeat;

  // Calculate the content width based on the longest clip
  // Determine content width from note end in beats
  const lastEndSeconds = track.notes.length
    ? Math.max(...track.notes.map((n) => n.time + n.duration))
    : 0;
  const totalBeats = (lastEndSeconds * bpm) / 60;
  const contentWidth = Math.max(totalBeats * pixelsPerBeat, timelineWidth);

  // Get unique notes for positioning
  const uniqueNotes = Array.from(
    new Set(track.notes.map((note) => note.midi))
  ).sort((a, b) => b - a); // Sort descending (high to low)

  // Handle case where there are no notes
  if (uniqueNotes.length === 0) {
    return (
      <div className="bg-[var(--color-neir-light)] border-2 border-[var(--color-neir-dark)] rounded-lg p-4 shadow-lg">
        <div className="text-center py-8">
          <span className="font-bold text-[var(--color-neir-darkest)] text-lg">
            {midiFile.fileName}
          </span>
          <div className="text-[var(--color-neir-darkest)] mt-2">
            No note data found
          </div>
        </div>
      </div>
    );
  }

  // Calculate the actual range used in this MIDI file with padding
  const dataMinNote = Math.min(...uniqueNotes);
  const dataMaxNote = Math.max(...uniqueNotes);
  const paddingSemitones = 0; // No padding for tight fit

  const minNote = Math.max(0, dataMinNote - paddingSemitones);
  const maxNote = Math.min(127, dataMaxNote + paddingSemitones);
  const noteRange = maxNote - minNote;
  const rows = noteRange + 1;
  const noteHeight = 2;
  const rowHeight = Math.max(noteHeight, 2);
  const pianoRollHeight = rows * rowHeight;

  // Convert MIDI note to discrete row top (higher notes at top)
  const noteToY = (midiNote: number) => {
    const rowIndex = maxNote - midiNote; // 0 at top
    return rowIndex * rowHeight;
  };

  // Precompute horizontal grid positions
  const octavePositions = Array.from(
    { length: Math.ceil(noteRange / 12) + 1 },
    (_, i) => {
      const octaveStartNote = Math.floor(minNote / 12) * 12 + i * 12;
      return octaveStartNote >= minNote && octaveStartNote <= maxNote
        ? noteToY(octaveStartNote)
        : null;
    }
  ).filter((y): y is number => y !== null);

  // Minimal grid: only octave markers

  // Separate notes and CC events
  const noteEvents = track.notes.map((note) => ({
    type: "note" as const,
    time: note.time,
    duration: note.duration,
    midi: note.midi,
    velocity: note.velocity,
    name: note.name,
  }));

  const ccEvents = [
    // Program changes
    ...(track.controlChanges.programChange?.map((pc) => ({
      type: "programChange" as const,
      time: pc.time,
      value: pc.value,
      number: pc.number,
    })) || []),
    // Volume changes
    ...(track.controlChanges.volume?.map((v) => ({
      type: "volume" as const,
      time: v.time,
      value: v.value,
      number: v.number,
    })) || []),
    // Pan changes
    ...(track.controlChanges.pan?.map((p) => ({
      type: "pan" as const,
      time: p.time,
      value: p.value,
      number: p.number,
    })) || []),
  ].sort((a, b) => a.time - b.time);

  return (
    <div className="bg-[var(--color-neir-light)] border-2 border-[var(--color-neir-dark)] rounded-lg p-4 shadow-lg">
      {/* File info */}
      <div className="flex justify-between items-center">
        <span className="font-bold text-[var(--color-neir-darkest)] text-sm">
          {midiFile.fileName}
        </span>
        <span className="text-[var(--color-neir-darkest)] text-sm">
          {totalDuration.toFixed(2)}s
        </span>
      </div>

      {/* Notes Piano Roll */}
      <div className="mb-4">
        {/* Scrollable Timeline Container */}
        <div
          className="relative bg-gray-50 border border-[var(--color-neir-dark)] rounded overflow-x-auto overflow-y-hidden"
          style={{ width: timelineWidth, height: pianoRollHeight }}
        >
          {/* Timeline Content */}
          <div
            className="relative bg-white border-0"
            style={{ width: contentWidth, height: pianoRollHeight }}
          >
            {/* Grid lines */}
            <div className="absolute inset-0">
              {/* Horizontal grid lines (octave markers) */}
              <HorizontalBars positions={octavePositions} />

              {/* Vertical grid lines (bar markers) */}
              <VerticalBars
                count={Math.ceil(totalBeats / beatsPerBar) + 1}
                timeToX={(i) => timeToX(i * beatsPerBar)}
              />
            </div>

            {/* Note Events */}
            <div className="absolute inset-0">
              {noteEvents.map((event, index) => {
                return (
                  <MidiNote
                    key={index}
                    note={event as unknown as Note}
                    timeToX={timeToX}
                    noteToY={noteToY}
                    bpm={bpm}
                    noteHeight={noteHeight}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CC Events Piano Roll */}
      <div>
        <div className="text-sm font-medium text-[var(--color-neir-darkest)] mb-2">
          Control Changes
        </div>
        {/* Scrollable Timeline Container */}
        <div
          className="relative bg-gray-50 border border-[var(--color-neir-dark)] rounded overflow-x-auto overflow-y-hidden"
          style={{ width: timelineWidth, height: ccRollHeight }}
        >
          {/* Timeline Content */}
          <div
            className="relative bg-white border-0"
            style={{ width: contentWidth, height: ccRollHeight }}
          >
            {/* Grid lines */}
            <div className="absolute inset-0">
              {/* Vertical grid lines (bar markers) */}
              <VerticalBars
                count={Math.ceil(totalBeats / beatsPerBar) + 1}
                timeToX={(i) => timeToX(i * beatsPerBar)}
              />
            </div>

            {/* CC Events */}
            <div className="absolute inset-0">
              {ccEvents.map((event, index) => {
                const eventBeats = (event.time * bpm) / 60;
                const x = timeToX(eventBeats);

                return (
                  <div
                    key={index}
                    className="absolute w-2 h-2 rounded-full bg-[var(--yatsugi-grey-1)] border border-gray-700"
                    style={{ left: x, top: ccRollHeight / 2 - 4 }}
                    title={`${event.type}: ${event.value}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MidiPianoRoll;
