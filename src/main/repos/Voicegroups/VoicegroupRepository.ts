import { readFile, access, constants, readdir } from "fs/promises";
import { createInterface } from "node:readline";
import { resolve } from "node:path";
import { createReadStream } from "node:fs";
import type Config from "src/main/services/Config/Config";

type NodeKind =
  | "group"
  | "keysplit"
  | "directsound"
  | "programmable"
  | "square"
  | "noise"
  | "unknown";

export type VoiceNode = {
  kind: NodeKind;
  label?: string; // for groups
  macro?: string; // original macro name
  line?: string; // raw line
  children?: VoiceNode[]; // for groups/keysplit
  // leaf data
  sampleSymbol?: string; // DirectSoundWaveData_* or ProgrammableWaveData_*
  assetPath?: string; // resolved .bin or .pcm path
  params?: string[]; // other params parsed
};

class VoicegroupRepository {
  config: Config;
  get repoRoot() {
    return this.config.rootDir;
  }
  soundDir: string = "";
  voicegroupsDir: string = "";
  directSoundDataPath: string = "";
  programmableWaveDataPath: string = "";
  directSoundSymbolToAsset: Record<string, string> = {};
  programmableSymbolToAsset: Record<string, string> = {};
  // path to directory of game midi files.
  midiDirectory: string = "";

  mid2agbPath: string = "";

  voiceGroups: string[] = [];
  constructor(config: Config) {
    this.config = config;
  }

  async init() {
    const soundDir = resolve(this.repoRoot, "sound");
    this.voicegroupsDir = resolve(soundDir, "voicegroups");
    const directSoundDataPath = resolve(soundDir, "direct_sound_data.inc");
    this.programmableWaveDataPath = resolve(
      soundDir,
      "programmable_wave_data.inc"
    );
    this.directSoundSymbolToAsset =
      await this.loadSymbolMap(directSoundDataPath);
    this.programmableSymbolToAsset = await this.loadSymbolMap(
      this.programmableWaveDataPath
    );
  }
  public async getVoiceGroups() {
    if (this.voicegroupsDir === "") {
      await this.init();
    }
    if (this.voiceGroups.length === 0) {
      await this.loadVoiceGroups();
    }
    return this.voiceGroups;
  }
  private async loadVoiceGroups() {
    if (this.voiceGroups.length === 0) {
      await access(this.voicegroupsDir, constants.R_OK);

      this.voiceGroups = (await readdir(this.voicegroupsDir)).filter((file) =>
        file.endsWith(".inc")
      );
      if (this.voiceGroups.length === 0) {
        throw new Error("VoicegroupRepository: voicegroup directory is empty");
      }
    }
  }
  public async readVoicegroupFile(voicegroupName: string): Promise<VoiceNode> {
    if (this.repoRoot === "") {
      throw new Error("Repository root not set");
    }
    try {
      // First validate that the file exists and is readable
      const voicegroupFile = await this.resolveGroup(voicegroupName);
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
  /** Below here is just reading voicegroup trees */
  private async loadSymbolMap(
    filePath: string
  ): Promise<Record<string, string>> {
    try {
      await access(filePath, constants.R_OK);
    } catch (error) {
      console.error(error);
      return {};
    }
    try {
      const text = await readFile(filePath, "utf8");
      const map: Record<string, string> = {};
      // Match lines like: Label::\n  //   .incbin "path"
      const re = /(\w+)::[\s\S]*?\n\s*\.incbin\s+"([^"]+)"/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) {
        const label = m[1];
        const path = m[2];
        map[label] = resolve(this.repoRoot, path);
      }
      return map;
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  private parseVoiceLine(line: string): VoiceNode | null {
    const i = line.indexOf(" ");
    if (i === -1) {
      throw new Error(`Invalid voice line: ${line}`);
    }
    const macro = line.slice(0, i);
    const argsStr = line.slice(i + 1).trim();
    const args = argsStr.split(",").map((s: string) => s.trim());

    if (macro === "voice_keysplit" || macro === "voice_keysplit_all") {
      // We filter out commented lines before here - @ signs are right-side comments
      const targetGroup = args[0].includes("@")
        ? args[0].slice(0, args[0].lastIndexOf("@"))
        : args[0];
      return {
        kind: "keysplit",
        macro,
        line,
        params: args,
        label: targetGroup,
      };
    }
    if (macro.startsWith("voice_directsound")) {
      const sampleSymbol = args[2];
      const assetPath = this.directSoundSymbolToAsset[sampleSymbol];
      return {
        kind: "directsound",
        macro,
        line,
        params: args,
        sampleSymbol,
        assetPath,
      };
    }
    if (macro.startsWith("voice_programmable_wave")) {
      const sampleSymbol = args[2];
      const assetPath = this.programmableSymbolToAsset[sampleSymbol];
      return {
        kind: "programmable",
        macro,
        line,
        params: args,
        sampleSymbol,
        assetPath,
      };
    }
    if (macro.startsWith("voice_square"))
      return { kind: "square", macro, line, params: args };
    if (macro.startsWith("voice_noise"))
      return { kind: "noise", macro, line, params: args };
    return { kind: "unknown", macro, line, params: args };
  }
  private async parseVoicegroupFile(filePath: string): Promise<VoiceNode[]> {
    const nodes: VoiceNode[] = [];

    const rli = createInterface({
      input: createReadStream(filePath),
      crlfDelay: Infinity,
    });

    for await (const raw of rli) {
      if (!raw) break;
      const trimmed = raw.trim();
      if (!/^voice_\w+\b/.test(trimmed)) continue;
      const node = this.parseVoiceLine(trimmed);
      if (node) nodes.push(node);
    }

    // Skip lines containing periods (likely file paths or other data)

    // Parse the line - parseVoiceLine now always returns a VoiceNode

    return nodes;
  }

  public async resolveGroup(
    label: string,
    stack: string[] = []
  ): Promise<VoiceNode> {
    let fileName = label;
    if (label.includes(".") === false) {
      fileName = `${label.trimEnd()}.inc`;
    }
    const filePath = resolve(this.voicegroupsDir, fileName);
    try {
      await access(filePath, constants.R_OK);
    } catch (error) {
      console.error(error);
      throw new Error(`Voicegroup file not found for ${label}: ${filePath}`);
    }

    if (stack.includes(label)) {
      return {
        kind: "group",
        label,
        children: [{ kind: "unknown", line: `// cycle detected for ${label}` }],
      };
    }

    const nextStack = [...stack, label];
    const entries = await this.parseVoicegroupFile(filePath);
    const children: VoiceNode[] = [];
    for (const node of entries) {
      if (node.kind === "keysplit" && node.label) {
        // Follow into referenced voicegroup
        const sub = await this.resolveGroup(node.label, nextStack);
        children.push({ ...node, children: sub.children });
      } else {
        children.push(node);
      }
    }

    return { kind: "group", label, children };
  }
}

export default VoicegroupRepository;
