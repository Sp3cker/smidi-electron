import VoicegroupRepository from "../../repos/Voicegroups/VoicegroupRepository";
import Module from "../../voicegroupParser/build/release/Module.node";
import type Config from "../Config/Config";

const fetchVGDetails = (voicegroupName: string) => {
  return new Promise((resolve, reject) => {
    //@ts-ignore - native Module.node lacks TS types for keysplit callback signature
    Module.keysplit(voicegroupName, (err, result) => {
      if (err.length !== 0) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
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
      const vgLabel = voicegroupName.split(".")[0];
      console.time(`vg:fetch:${voicegroupName}`);
      const keysplitResult = await fetchVGDetails(vgLabel);
      // console.debug("VoicegroupsService: keysplitResult", keysplitResult);
      console.debug(
        "VoicegroupsService: getting voicegroup details",
        voicegroupName
      );
      // const vg = await this.repository.readVoicegroupFile(voicegroupName);
      console.timeEnd(`vg:fetch:${voicegroupName}`);
      return keysplitResult;
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
