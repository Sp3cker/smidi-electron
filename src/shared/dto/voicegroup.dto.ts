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

export type DirectSoundVoice = {
  type: "directsound";
  arguments: DSPGMArguments;
};
export type Square2Voice = {
  type: "square_2_noise";
  arguments: Square2NoiseArguments;
};
export type Square1Voice = {
  type: "square_1";
  arguments: Square1Arguments;
};
export type NoiseVoice = {
  type: "noise";
  arguments: Square2NoiseArguments;
};
export type GroupVoice = {
  voicegroup: string;
  voices: Node[];
};

export type Node = DirectSoundVoice | Square1Voice | Square2Voice | NoiseVoice;

export type Voicegroup = {
  name: string;
};
