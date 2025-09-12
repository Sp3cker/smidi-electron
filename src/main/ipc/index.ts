import { setConfigIpc } from "./configIpc";
import { setMidiManIpc } from "./midimanIpc";
import { setVoicegroupsIpc } from "./voicegroupsIpc";
import { sendToStream } from "../lib/messageChannels";
import type MidiManService from "../services/MidiMan/MidiMan";
import type VoicegroupsService from "../services/Voicegroups/VoicegroupsService";
import type Config from "../services/Config/Config";

const assignIPCtoServices = (
  configInstance: Config,
  midiManInstance: MidiManService,
  voicegroupsInstance: VoicegroupsService
) => {
  setConfigIpc(configInstance);
  setMidiManIpc(midiManInstance);
  setVoicegroupsIpc(voicegroupsInstance, sendToStream);
};

export default assignIPCtoServices;
