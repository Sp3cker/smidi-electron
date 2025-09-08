import { setConfigIpc } from "./configIpc";
import { setMidiManIpc } from "./midimanIpc";
import { setExpansionManIpc } from "./expansionmanIpc";
import type MidiManService from "../services/MidiMan/MidiMan";
import type ExpansionMan from "../services/ExpansionMan/ExpansionManager";
import type Config from "../services/Config/Config";

const assignIPCtoServices = (

  configInstance: Config,
  midiManInstance: MidiManService,
  expansionInstance: ExpansionMan
) => {
  setConfigIpc(configInstance);
  setMidiManIpc(midiManInstance);
  setExpansionManIpc(expansionInstance);
};

export default assignIPCtoServices;
