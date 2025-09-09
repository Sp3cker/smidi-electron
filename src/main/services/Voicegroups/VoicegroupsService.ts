import VoicegroupRepository from "../../repos/Voicegroups/VoicegroupRepository";
import type Config from "../Config/Config";

class VoicegroupsService {
  repository: VoicegroupRepository;

  constructor(config: Config) {
    this.repository = new VoicegroupRepository(config);
  }

  async getVoiceGroups() {
    try {
      console.debug("VoicegroupsService: getting voice groups");
      return this.repository.getVoiceGroups();
    } catch (error) {
      throw new Error("VoicegroupsService: error getting voice groups" + error);
    }
  }
  async getVoicegroupDetails(voicegroupName: string) {
    try {
      console.debug(
        "VoicegroupsService: getting voicegroup details",
        voicegroupName
      );
      return this.repository.readVoicegroupFile(voicegroupName);
    } catch (error) {
      console.error(
        "VoicegroupsService: error getting voicegroup details",
        error as Error
      );
      throw new Error("VoicegroupsService: error getting voicegroup details");
    }
  }
}

export default VoicegroupsService;
