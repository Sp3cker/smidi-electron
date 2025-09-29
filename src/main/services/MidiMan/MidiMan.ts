import type fs from "fs";
import { readdir } from "fs/promises";
import FileWatcher from "../../lib/FileWatcher";
import { MidiFile } from "@shared/MidiFile";
import Module from "../../voicegroupParser/build/release/Module.node";
import db from "../../lib/db";
export function parseMidiToResolution(midi: MidiFile) {
  const ppq = midi.header.ppq;

  const timeSig = midi.header.timeSignatures[0]?.timeSignature || [4, 4];

  const ticksPerBar = timeSig[0] * ppq * (4 / timeSig[1]); // So 4/4 time 96 PPQ = 96 ticks per 4 quarter notes

  const measures: any[][] = []; // { bar: NoteSegment[] }
  const track = midi.tracks[0];
  const highestNoteInMidi = Math.max(...track.notes.map((note) => note.midi));
  const lowestNoteInMidi = Math.min(...track.notes.map((note) => note.midi));
  track.notes.forEach((note) => {
    const durationTicksTotal = note.durationTicks;
    let remainingTicks = durationTicksTotal;
    let currentBar = Math.floor(note.ticks / ticksPerBar);
    let offsetTicksInBar = note.ticks % ticksPerBar;

    while (remainingTicks > 0) {
      if (!measures[currentBar]) measures[currentBar] = [];

      const ticksLeftInBar = ticksPerBar - offsetTicksInBar;
      const chunkTicks = Math.min(remainingTicks, ticksLeftInBar);

      measures[currentBar].push({
        midi: note.midi,
        name: note.name,
        velocity: note.velocity,
        offsetTicksInBar,
        durationTicksInBar: chunkTicks,
        startTick: note.ticks + (durationTicksTotal - remainingTicks),
        endTick: note.ticks + (durationTicksTotal - remainingTicks) + chunkTicks,
        originalNote: note,
      });

      remainingTicks -= chunkTicks;
      currentBar++;
      offsetTicksInBar = 0;
    }
  });
  measures.forEach((quarterNote) => {
    quarterNote.sort(
      (a, b) => a.offsetTicksInBar - b.offsetTicksInBar || b.midi - a.midi
    ); // Descending pitch like Ableton
  });
  // Sort notes per measure by offset and pitch

  const bars = measures.map(Number).sort((a, b) => a - b);
  const totalBars = bars.length ? bars.length : 0;

  return {
    highestNoteInMidi,
    lowestNoteInMidi,
    fileName: midi.fileName,
    filePath: midi.filePath,
    bars,
    measures,
    totalBars,
    ticksPerBar,
    timeSig,
  }; // Add metadata for grid calc
}

class MidiMan {
  fileWatcher: FileWatcher | null = null;
  watchDirectory: string | null = null;

  constructor() {
    return;
  }
  async setWatcher(directory: string) {
    this.watchDirectory = directory;
    await Module.readProjectFolder(directory);
    if (this.fileWatcher) {
      await this.fileWatcher.stop();
    }
    return new Promise((res, _) => {
      this.fileWatcher = new FileWatcher(directory);
      this.fileWatcher.emitter.on(
        "change",
        (obj: { path: string; stat: fs.Stats }) => {
          console.log("change", obj.path);
        }
      );
      this.fileWatcher.emitter.on("unlink", (obj: { path: string }) => {
        console.log("unlink", obj.path);
      });

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
