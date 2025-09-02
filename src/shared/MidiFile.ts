import { Midi, MidiJSON } from "@tonejs/midi";

/**
 * Serializable data structure for MidiFile that can be sent over IPC
 */
export interface MidiFileData {
  midiJson: MidiJSON;
  fileName: string;
  filePath: string;
}

/**
 * Extended Midi type that includes the original file information
 */
export class MidiFile extends Midi {
  /**
   * The original filename of the MIDI file (without path)
   */
  public readonly fileName: string;

  /**
   * The full path to the MIDI file
   */
  public readonly filePath: string;

  constructor(
    midiArray: ArrayLike<number> | ArrayBuffer,
    fileName: string,
    filePath: string
  ) {
    super(midiArray);
    this.fileName = fileName;
    this.filePath = filePath;
  }

  /**
   * Factory method to create MidiFile from a file path
   */
  static async fromFile(filePath: string): Promise<MidiFile> {
    const fs = await import("fs/promises");
    const buffer = await fs.readFile(filePath);
    const fileName = filePath.split("/").pop() || "unknown.mid";

    return new MidiFile(buffer, fileName, filePath);
  }

  /**
   * Convert to serializable format for IPC transfer
   */
  toSerializable(): MidiFileData {
    return {
      midiJson: this.toJSON(),
      fileName: this.fileName,
      filePath: this.filePath,
    };
  }

  /**
   * Create MidiFile from serialized data
   */
  static fromSerializable(data: MidiFileData): MidiFile {
    const midi = new Midi();
    midi.fromJSON(data.midiJson);
    return new MidiFile(midi.toArray(), data.fileName, data.filePath);
  }
}
