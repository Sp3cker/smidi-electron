export * from "./config.dto";
export * from "./voicegroup.dto";
export * from "./project.dto";
// Minimal shape of a note from @tonejs/midi that we rely on
export type OriginalMidiNote = {
  midi: number;
  name: string;
  ticks: number;
  duration: number;
  durationTicks: number;
  velocity: number;
  channel?: number;
};

export type DomainError = {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
};

export type UserFriendlyError = {
  message: string;
  code?: string;
  recoverable: boolean;
};

// Note segment type for parsed MIDI data
export type NoteSegment = {
  midi: number; // MIDI note number (0-127)
  name: string; // Note name (e.g., 'C4')
  velocity: number; // Note velocity (0-127)
  offsetTicksInBar: number; // Tick offset within the bar
  durationTicksInBar: number; // Duration in ticks within the bar
  startTick: number; // Absolute start tick in the MIDI file
  endTick: number; // Absolute end tick in the MIDI file
  originalNote: OriginalMidiNote; // Reference-like to the original @tonejs/midi Note
};

// Parsed MIDI structure returned by parseMidiToResolution
export type ParsedMidiTrack = {
  trackName: string;
  sourcePath: string;
  pitchRange: {
    lowest: number;
    highest: number;
  };
  measures: Array<{
    index: number;
    segments: NoteSegment[];
  }>;
  measureCount: number;
  lastMeasureIndex: number;
  ticksPerMeasure: number;
  timeSignature: {
    beatsPerBar: number;
    beatUnit: number;
  };
};

// src/shared/dto/ConfigDTOs.ts

// Command DTOs (for requests)
