import { createReadStream, existsSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { getHeapStatistics, writeHeapSnapshot } from "node:v8";
type NodeKind =
  | "group"
  | "keysplit"
  | "directsound"
  | "programmable"
  | "square"
  | "noise"
  | "unknown";

type VoiceNode = {
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

// Workspace root (assume dev_scripts/voicegroup-resolver within repo)

const repoRoot = resolve(
  "/Users/spencer/dev/nodeProjects/pokeemerald-expansion/"
);

// Paths of interest
const soundDir = resolve(repoRoot, "sound");
const voicegroupsDir = resolve(soundDir, "voicegroups");
const directSoundDataPath = resolve(soundDir, "direct_sound_data.inc");
const programmableWaveDataPath = resolve(
  soundDir,
  "programmable_wave_data.inc"
);

// Preload symbol -> asset path maps for quick resolution
function loadSymbolMap(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {};
  const text = readFileSync(filePath, "utf8");
  const map: Record<string, string> = {};
  // Match lines like: Label::\n  //   .incbin "path"
  const re = /(\w+)::[\s\S]*?\n\s*\.incbin\s+"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const label = m[1];
    const path = m[2];
    map[label] = resolve(repoRoot, path);
  }
  return map;
}

const directSoundSymbolToAsset = loadSymbolMap(directSoundDataPath);
const programmableSymbolToAsset = loadSymbolMap(programmableWaveDataPath);

// Parse a single voice line to a VoiceNode (separate line parsing)
function parseVoiceLine(line: string): VoiceNode {
  // const trimmed = line.trim();

  const i = line.indexOf(" ");
  if (i === -1) {
    throw new Error(`Invalid voice line: ${line}`);
  }
  // const macro = i === -1 ? line : line.slice(0, i);
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
    const assetPath = directSoundSymbolToAsset[sampleSymbol];
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
    const assetPath = programmableSymbolToAsset[sampleSymbol];
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

// Parse a voicegroup file into an ordered list of VoiceNode entries (1-based index matches instrument program numbers inside that group)
async function parseVoicegroupFile(filePath: string): Promise<VoiceNode[]> {
  const nodes: VoiceNode[] = [];

  const rli = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const raw of rli) {
    if (!raw) break;
    const trimmed = raw.trim();
    if (!/^voice_\w+\b/.test(trimmed)) continue;
    const node = parseVoiceLine(trimmed);
    if (node) nodes.push(node);
    // if (trimmed.at(1) === ".") break; // First two lines
    // Skip label definitions (handled elsewhere)

    // if (trimmed.startsWith("//") || trimmed.startsWith("@")) break;
    // The ! in the regex /^voice_\w+\b/ is not present; perhaps you meant the ! in the line:
    // if (!/^voice_\w+\b/.test(trimmed)) break;
    // In this context, the ! is the JavaScript "not" operator. It negates the result of the regex test.
    // So, if the line does NOT match the regex (i.e., does not start with "voice_" followed by word characters), the loop breaks.
  }

  // Skip lines containing periods (likely file paths or other data)

  // Parse the line - parseVoiceLine now always returns a VoiceNode

  return nodes;
}

// Resolve a voicegroup label to its file path
function voicegroupToPath(label: string): string {
  // Expect labels like voicegroup164, optionally with trailing content
  const m = label.match(/^voicegroup(\d{1,3})/);
  if (!m) throw new Error(`Unsupported voicegroup label: ${label}`);

  return resolve(voicegroupsDir, `voicegroup${m[1]}.inc`);
}

// Recursively resolve nodes: for keysplit nodes, we load the referenced group and attach its children
async function resolveGroup(
  label: string,
  stack: string[] = []
): Promise<VoiceNode> {
  const filePath = voicegroupToPath(label);
  if (!existsSync(filePath))
    throw new Error(`Voicegroup file not found for ${label}: ${filePath}`);
  debugger;
  if (stack.includes(label)) {
    return {
      kind: "group",
      label,
      children: [{ kind: "unknown", line: `// cycle detected for ${label}` }],
    };
  }
  const nextStack = [...stack, label];
  const entries = await parseVoicegroupFile(filePath);
  const children: VoiceNode[] = [];
  for (const node of entries) {
    if (node.kind === "keysplit" && node.label) {
      // Follow into referenced voicegroup
      const sub = await resolveGroup(node.label, nextStack);
      children.push({ ...node, children: sub.children });
    } else {
      children.push(node);
    }
  }
  return { kind: "group", label, children };
}

// JSON shape with recursive { type, samples } objects
type JsonNode = {
  type: NodeKind;
  voicegroup?: string;
  sampleSymbol?: string;
  assetPath?: string;
  params?: string[];
  samples?: JsonNode[];
};

function toJson(node: VoiceNode): JsonNode {
  const base: JsonNode = {
    type: node.kind,
    voicegroup: node.label,
    sampleSymbol: node.sampleSymbol,
    assetPath: node.assetPath,
    params: node.params,
  };
  if (node.children) base.samples = node.children.map(toJson);
  return base;
}

// Measure object size using various methods
function measureObjectSize(obj: any, label: string): void {
  console.log(`\n=== ${label} Size Analysis ===`);

  // Method 1: JSON string size
  const jsonStr = JSON.stringify(obj);
  console.log(`JSON string length: ${jsonStr.length} characters`);
  console.log(`JSON bytes: ${Buffer.byteLength(jsonStr, "utf8")} bytes`);

  // Method 2: Rough estimation
  function estimateSize(o: any): number {
    let size = 0;
    const visited = new WeakSet();

    function traverse(obj: any): void {
      if (obj === null || obj === undefined) return;

      // Only add objects to WeakSet, not primitives
      if (typeof obj === "object" && obj !== null) {
        if (visited.has(obj)) return;
        visited.add(obj);
      }

      if (typeof obj === "string") {
        size += obj.length * 2; // UTF-16
      } else if (typeof obj === "number") {
        size += 8; // 64-bit
      } else if (typeof obj === "boolean") {
        size += 1;
      } else if (Array.isArray(obj)) {
        size += 8; // Array overhead
        obj.forEach(traverse);
      } else if (obj && typeof obj === "object") {
        size += 8; // Object overhead
        Object.values(obj).forEach(traverse);
      }
    }

    traverse(o);
    return size;
  }

  const estimatedSize = estimateSize(obj);
  console.log(`Estimated object size: ${estimatedSize} bytes`);

  // Method 3: V8 heap statistics
  const heapStats = getHeapStatistics();
  console.log(`V8 heap used: ${heapStats.used_heap_size} bytes`);
  console.log(`V8 heap total: ${heapStats.total_heap_size} bytes`);

  // Method 4: Count nodes recursively
  function countNodes(node: VoiceNode): number {
    let count = 1;
    if (node.children) {
      count += node.children.reduce((sum, child) => sum + countNodes(child), 0);
    }
    return count;
  }

  const nodeCount = countNodes(obj);
  console.log(`Total nodes in tree: ${nodeCount}`);
  console.log(
    `Average size per node: ${Math.round(estimatedSize / nodeCount)} bytes`
  );
}

// CLI
async function main() {
  console.time("Script execution time");

  const [, , arg1, arg2] = process.argv;
  const argLabel = arg1 && !arg1.startsWith("-") ? arg1 : undefined;

  if (!argLabel) {
    console.error(
      "Usage: resolve-voicegroup <voicegroupNNN> [--json|--tree] [--heap-snapshot]"
    );
    process.exit(1);
  }

  console.time("Voicegroup resolution time");
  const root = await resolveGroup(argLabel);
  await writeFile(`${argLabel}.json`, JSON.stringify(root, null, 2), );
  console.timeEnd("Voicegroup resolution time");

  // Measure the size of the root object
  measureObjectSize(root, "Root Object");

  // Optional: Generate heap snapshot for detailed analysis
  if (process.argv.includes("--heap-snapshot")) {
    const snapshotPath = `heap-snapshot-${argLabel}-${Date.now()}.heapsnapshot`;
    writeHeapSnapshot(snapshotPath);
    console.log(`\nHeap snapshot saved to: ${snapshotPath}`);
    console.log("Use Chrome DevTools to analyze the snapshot:");
    console.log("1. Open chrome://inspect");
    console.log("2. Click 'Open dedicated DevTools for Node'");
    console.log("3. Go to Memory tab");
    console.log("4. Load the .heapsnapshot file");
  }

  console.timeEnd("Script execution time");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
