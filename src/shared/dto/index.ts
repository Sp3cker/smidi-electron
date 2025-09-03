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
export type ParsedMidiMeasures = {
  highestNoteInMidi: number;
  lowestNoteInMidi: number;
  fileName: string;
  filePath: string;
  bars: Array<number | undefined>;
  measures: Array<NoteSegment[] | undefined>;
  totalBars: number;
  ticksPerBar: number;
  timeSig: [number, number];
};

// src/shared/dto/ConfigDTOs.ts

// Command DTOs (for requests)
export type UpdateConfigCommand = {
  key: string;
  value: string;
};

export type GetConfigQuery = {
  // No payload needed, but could include filters if needed
};

export type ConfigResponse =
  | {
      success: true;
      data: ConfigData;
    }
  | {
      success: false;
      error: DomainError;
    };

export type ConfigData = {
  expansionDirectory: string;
  // Add other config properties as needed
};

// Database row type (matches what ConfigRepository returns)
export type ConfigRow = {
  key: string;
  value: string;
};

// Value Objects
export type ConfigKey = "expansionDirectory" | "otherConfigKeys";
