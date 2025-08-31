import path from "path";
import type Config from "../Config/Config";

class ExpansionManager {
  // string of voicegroup file name
  voiceGroups: string[] = [];
  // path to directory of game midi files.
  expansionMidiDirectory: string = "";
  mid2agbPath: string = "";
  constructor(private readonly config: Config) {
    const globalConfig = this.config.getConfig();
    if (!globalConfig) {
      throw new Error("No global config found");
    }
    this.voiceGroups = ["voicegroup_1", "voicegroup_2"];
    this.setExpansionPathsfromRoot(globalConfig.expansionDir);
    return;
  }
  // pass this the expansion directory from config.
  setExpansionPathsfromRoot(root: string) {
    console.debug("ExpansionManager: setting expansion paths from root", root);
    this.expansionMidiDirectory = path.join(root, "expansion", "midi");
    this.mid2agbPath = path.join(root, "expansion", "mid2agb");
  }
  getVoiceGroups() {
    return this.voiceGroups;
  }
}

export default ExpansionManager;
