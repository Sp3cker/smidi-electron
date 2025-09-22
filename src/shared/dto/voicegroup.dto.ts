export type VoicegroupResponse = {
  success: true;
  data: Voicegroup[];
};

export type DSPGMArguments = [
  number,
  number,
  string,
  number,
  number,
  number,
  number,
];
export type Square2NoiseArguments = [
  number,
  number,
  number,
  number,
  number,
  number,
];
export type Square1Arguments = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export type KeysplitVoice = {
  type: "Keysplit";
  keysplit: string;
  voices: Node[];
};
export type DirectSoundVoice = {
  type: "DirectSound";
  arguments: DSPGMArguments;
};
export type ProgramWaveVoice = {
  type: "Programwave";
  arguments: DSPGMArguments;
};
export type Square2Voice = {
  type: "Square2";
  arguments: Square2NoiseArguments;
};
export type Square1Voice = {
  type: "Square1";
  arguments: Square1Arguments;
};
export type NoiseVoice = {
  type: "Noise";
  arguments: Square2NoiseArguments;
};
export type GroupVoice = {
  type: "Group";
  voicegroup: string;
  voices: Node[];
};

export type Node =
  | GroupVoice
  | KeysplitVoice
  | DirectSoundVoice
  | ProgramWaveVoice
  | Square1Voice
  | Square2Voice
  | NoiseVoice;

export type Voicegroup = {
  name: string;
};
