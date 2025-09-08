import type Config from "../Config/Config";
import ExpansionRepository from "../repos/Expansion/ExpansionRepository";
import VoicegroupRepository from "../repos/Expansion/VoicegroupRepository";

class ExpansionManager {
  expansionRepository: ExpansionRepository = new ExpansionRepository();
  voicegroupRepository: VoicegroupRepository = new VoicegroupRepository();
  constructor(private readonly config: Config) {
    const globalConfig = this.config.getConfig();
    if (!globalConfig) {
      throw new Error("No global config found");
    }
    // this.voiceGroups = ["voicegroup_1", "voicegroup_2"];
    this.setExpansionPathsfromRoot(globalConfig.expansionDir);

    return;
  }
  // pass this the expansion directory from config.
  setExpansionPathsfromRoot(root: string) {
    console.debug("ExpansionManager: setting expansion paths from root", root);
    this.expansionRepository.setRepoRoot(root);
    this.voicegroupRepository.init(root);
  }

  async getVoiceGroups() {
    try {
      console.debug("ExpansionManager: getting voice groups");
      return this.voicegroupRepository.loadVoiceGroups();
    } catch (error) {
      console.error("ExpansionManager: error getting voice groups", error);
      return [];
    }
  }
  async getVoicegroupDetails(voicegroupName: string) {
    try {
      console.debug(
        "ExpansionManager: getting voicegroup details",
        voicegroupName
      );
      return this.voicegroupRepository.readVoicegroupFile(voicegroupName);
    } catch (error) {
      console.error(
        "ExpansionManager: error getting voicegroup details",
        error
      );
      throw new Error("ExpansionManager: error getting voicegroup details");
    }
    return this.voicegroupRepository.readVoicegroupFile(voicegroupName);
  }
}

export default ExpansionManager;
