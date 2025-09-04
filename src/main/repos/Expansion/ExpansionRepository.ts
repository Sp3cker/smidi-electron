import { readFile, access } from "fs/promises";
import {} from 'streamx'
import { constants } from "fs";

class ExpansionRepository {
  constructor() {
    // Remove circular reference - this class doesn't need to instantiate itself
  }

  async readVoicegroupFile(voicegroupName: string): Promise<string> {
    try {
      // First validate that the file exists and is readable
      await access(voicegroupName, constants.R_OK);

      // Read the file content as UTF-8 string
      const voicegroupFile = await readFile(voicegroupName, "utf8");
      return voicegroupFile;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("ENOENT")) {
          throw new Error(`Voicegroup file not found: ${voicegroupName}`);
        } else if (error.message.includes("EACCES")) {
          throw new Error(
            `Cannot read voicegroup file: ${voicegroupName} - permission denied`
          );
        }
      }
      throw new Error(
        `Failed to read voicegroup file ${voicegroupName}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export default ExpansionRepository;
