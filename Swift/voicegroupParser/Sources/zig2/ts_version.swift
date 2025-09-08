import Foundation
import RegexBuilder

// TS-inspired fast parser and resolver

enum TSNodeKind: String, Codable {
      case group
      case keysplit
      case directsound
      case programmable
      case square
      case noise
      case unknown
}
// struct ADSREnvelope {
//       let attack: Int8;
//       let sustain: Int8;
//       let decay: Int8;
//       let release: Int8;

// }
struct TSNode: Codable {
      let type: TSNodeKind
      let voicegroup: String?
      let voiceType: String?
      let params: [String]?
      let sampleSymbol: String?
      let assetPath: String?
      let samples: [TSNode]?
}

enum TSParseError: Error { case invalidLine }

struct TSSymbolMaps {
      let directSound: [String: String]
      let programmable: [String: String]
}

// let incbinRegex = Regex {
//       Capture { OneOrMore(.word) }
// }

struct TSVersion {
      let repoRoot: String
      let soundDir: String
      let voicegroupsDir: String
      let directSoundDataPath: String
      let programmableWaveDataPath: String

      init(repoRoot: String) {
            self.repoRoot = repoRoot
            self.soundDir = repoRoot + "/sound"
            self.voicegroupsDir = soundDir + "/voicegroups"
            self.directSoundDataPath = soundDir + "/direct_sound_data.inc"
            self.programmableWaveDataPath = soundDir + "/programmable_wave_data.inc"
      }

      func loadSymbolMap(_ filePath: String) -> [String: String] {
            guard FileManager.default.fileExists(atPath: filePath) else { return [:] }
            guard let text = try? String(contentsOfFile: filePath, encoding: .utf8) else {
                  return [:]
            }
            var map: [String: String] = [:]
            // Simple state machine: look for "Label::" then next line with .incbin "path"
            var lastLabel: String? = nil
            for rawLine in text.split(separator: "\n", omittingEmptySubsequences: false) {
                  if let range = rawLine.range(of: "::") {
                        let label = rawLine[..<range.lowerBound]
                        let trimmed = label.trimmingCharacters(in: .whitespaces)
                        if !trimmed.isEmpty { lastLabel = String(trimmed) }
                        continue
                  }
                  if let incRange = rawLine.range(of: ".incbin") {
                        let afterInc = incRange.upperBound
                        if let startQuote = rawLine[afterInc...].firstIndex(of: "\"") {
                              let afterStart = rawLine.index(after: startQuote)
                              if let endQuote = rawLine[afterStart...].firstIndex(of: "\"") {
                                    let path = rawLine[afterStart..<endQuote]
                                    if let lbl = lastLabel {
                                          map[lbl] = repoRoot + "/" + String(path)
                                    }
                                    lastLabel = nil
                              }
                        }
                  }
            }
            return map
      }

      func preloadSymbols() -> TSSymbolMaps {
            let ds = loadSymbolMap(directSoundDataPath)
            let pw = loadSymbolMap(programmableWaveDataPath)
            return TSSymbolMaps(directSound: ds, programmable: pw)
      }

      func voicegroupPath(label: String) -> String {
            // label like voicegroup229 (ignore trailing)
            let digits = label.drop(while: { !$0.isNumber })
            let num = digits.prefix(while: { $0.isNumber })
            return voicegroupsDir + "/voicegroup" + String(num) + ".inc"
      }
      // func parseADSR(line: Substring) {

      // }
      func parseKeySplitTable(path: String) {
            guard let text = try? String(contentsOfFile: path, encoding: .utf8) else { return }
            var out: [Int] = []
            out.reserveCapacity(128)
            for raw in text.split(separator: "\n",    omittingEmptySubsequences: true) {
                  let line = raw.
            }
      }
      func parseLineFast(_ line: Substring, symbols: TSSymbolMaps) -> TSNode? {
            // Require starts with voice_
            var i = line.startIndex
            while i < line.endIndex, line[i].isWhitespace { i = line.index(after: i) }
            guard i < line.endIndex else { return nil }
            guard line[i] == "v" else { return nil }
            guard line[i...].hasPrefix("voice_") else { return nil }
            // find first space
            guard let space = line[i...].firstIndex(of: " ") else { return nil }
            let voiceType = line[i..<space]
            let argsStr = line[line.index(after: space)...].trimmingCharacters(in: .whitespaces)
            let rawArgs: [String] = argsStr.split(separator: ",").map {
                  String($0.trimmingCharacters(in: .whitespaces))
            }

            if voiceType == "voice_keysplit" || voiceType == "voice_keysplit_all" {
                  var first: String = rawArgs.first ?? ""

                  if let at = first.lastIndex(of: "@") { first = String(first[..<at]) }
                  return TSNode(
                        type: .keysplit, voicegroup: first, voiceType: String(voiceType),
                        params: rawArgs, sampleSymbol: nil, assetPath: nil, samples: nil)
            }
            if voiceType.hasPrefix("voice_directsound") {
                  let sample: String = rawArgs.count > 2 ? rawArgs[2] : ""
                  let asset = symbols.directSound[sample]
                  return TSNode(
                        type: .directsound, voicegroup: nil, voiceType: String(voiceType),
                        params: rawArgs, sampleSymbol: sample, assetPath: asset, samples: nil)
            }
            if voiceType.hasPrefix("voice_programmable_wave") {
                  let sample: String = rawArgs.count > 2 ? rawArgs[2] : ""
                  let asset = symbols.programmable[sample]
                  return TSNode(
                        type: .programmable, voicegroup: nil, voiceType: String(voiceType),
                        params: rawArgs, sampleSymbol: sample, assetPath: asset, samples: nil)
            }
            if voiceType.hasPrefix("voice_square") {
                  return TSNode(
                        type: .square, voicegroup: nil, voiceType: String(voiceType),
                        params: rawArgs, sampleSymbol: nil, assetPath: nil, samples: nil)
            }
            if voiceType.hasPrefix("voice_noise") {
                  return TSNode(
                        type: .noise, voicegroup: nil, voiceType: String(voiceType),
                        params: rawArgs, sampleSymbol: nil, assetPath: nil, samples: nil)
            }
            return TSNode(
                  type: .unknown, voicegroup: nil, voiceType: String(voiceType), params: rawArgs,
                  sampleSymbol: nil, assetPath: nil, samples: nil)
      }

      func parseVoicegroupFile(path: String, symbols: TSSymbolMaps) throws -> [TSNode] {
            guard let text = try? String(contentsOfFile: path, encoding: .utf8) else { return [] }
            var nodes: [TSNode] = []
            nodes.reserveCapacity(64)
            for raw in text.split(separator: "\n", omittingEmptySubsequences: true) {
                  let trimmed = raw.trimmingCharacters(in: .whitespaces)
                  if trimmed.isEmpty { continue }
                  if !trimmed.hasPrefix("voice_") { continue }
                  if let node = parseLineFast(trimmed[...], symbols: symbols) {
                        nodes.append(node)
                  }
            }
            return nodes
      }

      func resolveGroup(
            label: String, symbols: TSSymbolMaps, cache: inout [String: TSNode],
            stack: inout Set<String>
      ) throws -> TSNode {
            if let cached = cache[label] { return cached }
            if stack.contains(label) {
                  return TSNode(
                        type: .group, voicegroup: label, voiceType: nil, params: nil,
                        sampleSymbol: nil, assetPath: nil,
                        samples: [
                              TSNode(
                                    type: .unknown, voicegroup: nil, voiceType: nil,
                                    params: ["cycle detected"], sampleSymbol: nil, assetPath: nil,
                                    samples: nil)
                        ])
            }
            stack.insert(label)
            let path = voicegroupPath(label: label)
            let entries = try parseVoicegroupFile(path: path, symbols: symbols)
            var children: [TSNode] = []
            children.reserveCapacity(entries.count)
            for node in entries {
                  if node.type == .keysplit, let sub = node.voicegroup {
                        var localStack = stack
                        let subnode = try resolveGroup(
                              label: sub, symbols: symbols, cache: &cache, stack: &localStack)
                        let merged = TSNode(
                              type: .keysplit, voicegroup: node.voicegroup,
                              voiceType: node.voiceType, params: node.params, sampleSymbol: nil,
                              assetPath: nil, samples: subnode.samples)
                        children.append(merged)
                  } else {
                        children.append(node)
                  }
            }
            let group = TSNode(
                  type: .group, voicegroup: label, voiceType: nil, params: nil, sampleSymbol: nil,
                  assetPath: nil, samples: children)
            cache[label] = group
            stack.remove(label)
            return group
      }

      func writeJSON(label: String, node: TSNode) throws {
            let encoder = JSONEncoder()
            encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
            let data = try encoder.encode(node)
            let url = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
                  .appendingPathComponent("\(label).json")
            try data.write(to: url)
      }
}

// Optional CLI-like entry point for testing
struct TSMain {
      static func run(label: String = "voicegroup229") {
            let ts = TSVersion(repoRoot: "/Users/spencer/dev/nodeProjects/pokeemerald-expansion")
            let symbols = ts.preloadSymbols()
            var cache: [String: TSNode] = [:]
            var stack: Set<String> = []
            do {
                  print("YOO")
                  let start = Date()
                  let root = try ts.resolveGroup(
                        label: label, symbols: symbols, cache: &cache, stack: &stack)
                  try ts.writeJSON(label: label, node: root)
                  let elapsed = Date().timeIntervalSince(start) * 1000
                  fputs(String(format: "TSVersion elapsed: %.1fms\n", elapsed), stderr)
            } catch {
                  print("TSVersion error:", error)
            }
      }
}
