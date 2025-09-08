import VoicegroupRepository from "src/main/repos/Voicegroups/VoicegroupRepository";
import Config from "../Config/Config";

class VoicegroupsService {
  repository: VoicegroupRepository = new VoicegroupRepository();
  private config: Config;
  //
  constructor(config: Config) {
    this.config = config;
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
}
