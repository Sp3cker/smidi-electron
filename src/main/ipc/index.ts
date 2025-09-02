import { setConfigIpc } from "./configIpc";
import { setMidiManIpc } from "./midimanIpc";
import { setExpansionManIpc } from "./expansionmanIpc";
import type MidiMan from "../MidiMan/MidiMan";
import type ExpansionMan from "../ExpansionMan/ExpansionManager";
import type Config from "../Config/Config";

const assignIPCtoServices = (

  configInstance: Config,
  midiManInstance: MidiMan,
  expansionInstance: ExpansionMan
) => {
  setConfigIpc(configInstance);
  setMidiManIpc(midiManInstance);
  setExpansionManIpc(expansionInstance);
};

export default assignIPCtoServices;
