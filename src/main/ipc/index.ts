import { setConfigIpc } from "./configIpc";
import { setMidiManIpc } from "./midimanIpc";
import { setVoicegroupsIpc } from "./voicegroupsIpc";
import { setProjectsIpc } from "./projectsIpc";
import { sendToStream } from "../lib/messageChannels";
import type MidiManService from "../services/MidiMan/MidiMan";
import type VoicegroupsService from "../services/Voicegroups/VoicegroupsService";
import type ProjectService from "../services/Project/ProjectService";
import type Config from "../services/Config/Config";

const assignIPCtoServices = (
  configInstance: Config,
  midiManInstance: MidiManService,
  voicegroupsInstance: VoicegroupsService,
  projectInstance: ProjectService
) => {
  setConfigIpc(configInstance);
  setMidiManIpc(midiManInstance);
  setVoicegroupsIpc(voicegroupsInstance, sendToStream);
  setProjectsIpc(projectInstance);
};

export default assignIPCtoServices;
