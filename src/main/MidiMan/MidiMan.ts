import type fs from "fs";
import { readdir } from "fs/promises";
import FileWatcher from "../lib/FileWatcher";
import { MidiFile } from "@shared/MidiFile";

export function parseMidiToResolution(
  midi: MidiFile,
  fallbackBpm: number = 120
) {
  const ppq = midi.header.ppq;
  const bpm = midi.header.tempos[0]?.bpm || fallbackBpm;
  const timeSig = midi.header.timeSignatures[0]?.timeSignature || [4, 4];
  const beatsPerBar = timeSig[0];
  const beatNoteValue = timeSig[1];
  const ticksPerBar = beatsPerBar * ppq * (4 / beatNoteValue);
  const ticksPer128 = ticksPerBar / 128;
  const ticksPerSecond = (bpm / 60) * ppq;

  const measures = {}; // { bar: NoteSegment[] }
  const track = midi.tracks[0];

  track.notes.forEach((note) => {
    const bar = Math.floor(note.ticks / ticksPerBar);
    const fractionInBar = (note.ticks % ticksPerBar) / ticksPerBar;
    const offset128 = Math.floor(fractionInBar * 128);
    const durationTicks = note.duration * ticksPerSecond;
    let remaining128 = Math.round(durationTicks / ticksPer128);

    let currentBar = bar;
    let currentOffset = offset128;

    while (remaining128 > 0) {
      if (!measures[currentBar]) measures[currentBar] = [];

      const slotsInBar = 128 - currentOffset;
      const durationInBar = Math.min(remaining128, slotsInBar);

      measures[currentBar].push({
        midi: note.midi,
        name: note.name,
        velocity: note.velocity,
        offset128: currentOffset, // Start offset in this bar (0-127)
        duration128: durationInBar,
        originalNote: note, // Optional: Ref to original for editing
      });

      remaining128 -= durationInBar;
      currentBar++;
      currentOffset = 0;
    }
  });

  // Sort notes per measure by offset and pitch
  Object.keys(measures).forEach((bar) => {
    measures[bar].sort((a, b) => a.offset128 - b.offset128 || b.midi - a.midi); // Descending pitch like Ableton
  });

  const bars = Object.keys(measures)
    .map(Number)
    .sort((a, b) => a - b);
  const totalBars = bars.length ? bars[bars.length - 1] + 1 : 1; // Min 1 bar

  return { bars, measures, totalBars, ticksPerBar, timeSig }; // Add metadata for grid calc
}

// Usage:
// const processed = processMidiToMeasures(midi, 120);

// Usage example:
// const midi = await Midi.fromUrl('path/to/file.mid');
// const formatted = formatNotesTo128Measures(midi, 120); // fallback BPM if MIDI lacks it
// console.log(formatted);
// try {
//   console.log("Midiman: Parsing midi to resolution", midi.header.ppq);

//   // Parse MIDI data

//   const ppqn = midi.header.ppq; // Ticks per quarter note
//   const beatsPerMeasure = timeSignature[0]; // e.g., 4 for 4/4
//   const beatNoteValue = timeSignature[1]; // e.g., 4 for quarter note

//   // Calculate ticks per 1/128 note

//   const ticksPer128thNote = ppqn / (resolution / 4); // 1/128 note = 1/32 of a quarter note

//   // Calculate ticks per measure (e.g., 4 quarter notes in 4/4)
//   const ticksPerMeasure = ppqn * beatsPerMeasure * (4 / beatNoteValue);

//   // Number of 1/128 notes per measure
//   const num128thNotesPerMeasure = ticksPerMeasure / ticksPer128thNote;

//   // Initialize output structure
//   const measures = {};

//   // Process each track
//   midi.tracks.forEach((track, trackIndex) => {
//     track.notes.forEach((note) => {
//       // Get note start time in ticks
//       const startTicks = note.ticks;

//       // Calculate measure and position within measure
//       const measureNumber = Math.floor(startTicks / ticksPerMeasure);
//       const positionInMeasureTicks = startTicks % ticksPerMeasure;
//       const positionIn128thNotes = Math.round(
//         positionInMeasureTicks / ticksPer128thNote
//       );

//       // Initialize measure if not exists
//       if (!measures[measureNumber]) {
//         measures[measureNumber] = Array(num128thNotesPerMeasure).fill([]);
//       }

//       // Add note to the appropriate 1/128 note slot
//       measures[measureNumber][positionIn128thNotes].push({
//         note: note.name, // e.g., 'C4'
//         velocity: note.velocity,
//         durationTicks: note.durationTicks,
//         track: trackIndex,
//       });
//     });
//   });

//   return measure

class MidiMan {
  fileWatcher: FileWatcher | null = null;
  watchDirectory: string | null = null;

  constructor() {
    return;
  }
  async setWatcher(directory: string) {
    // console.log(JSON.stringify(process.memoryUsage().heapTotal));
    this.watchDirectory = directory;
    if (this.fileWatcher) {
      await this.fileWatcher.stop();
    }
    return new Promise((res, rej) => {
      this.fileWatcher = new FileWatcher(directory);
      // this.fileWatcher.emitter.on("add", (obj: { path: string }) => {
      //   // console.log("add", obj.path);
      // });
      this.fileWatcher.emitter.on(
        "change",
        (obj: { path: string; stat: fs.Stats }) => {
          console.log("change", obj.path);
        }
      );
      this.fileWatcher.emitter.on("unlink", (obj: { path: string }) => {
        console.log("unlink", obj.path);
      });
      // When the file watcher is ready, set the files we're watching
      // And emit them for the frontend
      this.fileWatcher.emitter.on("ready", (fileNames: string[]) => {
        if (fileNames.length > 0) {
          this.parseMidiDirectory().then((midiObjects) => {
            return res(midiObjects);
          });
        }
      });
    });
  }
  endWatch() {
    this.fileWatcher?.emitter.removeAllListeners();
  }
  async parseMidiDirectory() {
    if (!this.watchDirectory) {
      throw new Error("MidiMan: Can't parse midi, no watch directory set");
    }
    const rawMidiFiles = await readdir(this.watchDirectory).then((files) =>
      files.filter((file) => file.endsWith(".mid"))
    );
    if (rawMidiFiles.length === 0) {
      throw new Error("MidiMan: No midi files found in directory");
    }

    return Promise.all(
      rawMidiFiles.map(async (midiFile) => {
        return MidiFile.fromFile(this.watchDirectory + "/" + midiFile);
      })
    );
  }
}

export default MidiMan;
