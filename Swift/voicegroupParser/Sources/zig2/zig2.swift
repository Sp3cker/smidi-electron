import Foundation

// A voicegroup file can have one of these

struct Keysplit {
      let lineReferencedFrom: Int
      let type: Substring
      let toVoicegroup: Substring
      let usingKeysplit: Substring?
}

struct InstrumentVoice {
      let attack: Int
      let sustain: Int
      let decay: Int
      // ...
}

// MARK: - Models for hybrid indexing

typealias VoicegroupID = String

enum LineKind {
      case voiceKeysplit(type: Substring, target: Substring, using: Substring?)
      case comment
      case blank
      case other
}

struct SourceLine {
      let number: Int
      let text: Substring
      let kind: LineKind
}

struct VoicegroupFile {
      let id: VoicegroupID
      let path: String
      let lines: [SourceLine]
}
func lineStartsMatchingString(file: String) throws -> [Keysplit] {

      var out: [Keysplit] = []
      for (i, line) in file.split(whereSeparator: \.isNewline).enumerated() {
            // if i < 2 { continue }
            // let trimmed = line.drop(while: { $0.isWhitespace })
            if line.hasPrefix("\tvoice_keysplit") {

                  let parts = line.split(
                        maxSplits: 3, omittingEmptySubsequences: true,
                        whereSeparator: { $0 == " " })
                  guard parts.count >= 2 else { continue }
                  let usingKeysplit: Substring? = parts.count > 2 ? parts[2] : nil
                  var toVoice = parts[1]

                  // Remove trailing comma if present on voicegroupxxx
                  if toVoice.hasSuffix(",") {
                        toVoice = toVoice.dropLast()
                  }

                  // Efficiently trim whitespace from both ends
                  toVoice = toVoice.drop(while: { $0.isWhitespace })
                  while toVoice.last?.isWhitespace == true {
                        toVoice = toVoice.dropLast()
                  }

                  let vg = Keysplit(
                        lineReferencedFrom: i + 1,
                        type: parts[0],
                        toVoicegroup: App.voicegroupPath + (toVoice) + ".inc",
                        usingKeysplit: usingKeysplit)
                  out.append(vg)
            }
      }
      return out
}

@main
struct App {
      static let voicegroupPath: String =
            "/Users/spencer/dev/nodeProjects/pokeemerald-expansion/sound/voicegroups/"
      static func discoverVoicegroupFiles() throws -> [URL] {
            let fm = FileManager.default
            let contents = try fm.contentsOfDirectory(atPath: voicegroupPath)
            let incs = contents.filter { $0.hasPrefix("voicegroup") && $0.hasSuffix(".inc") }
            return incs.map { URL(fileURLWithPath: voicegroupPath + $0, isDirectory: false) }
      }

      static func voicegroupID(for url: URL) -> VoicegroupID {
            url.deletingPathExtension().lastPathComponent
      }

      static func parseVoicegroup(url: URL) throws -> VoicegroupFile {
            let file = try String(contentsOf: url, encoding: .utf8)
            let id = voicegroupID(for: url)

            let lines = file.split(separator: "\n", omittingEmptySubsequences: true)
            var parsed: [SourceLine] = []
            parsed.reserveCapacity(lines.count)
            for (i, raw) in lines.enumerated() {
                  let number = i + 1
                  if raw.isEmpty {
                        parsed.append(SourceLine(number: number, text: raw, kind: .blank))
                        continue
                  }
                  // if raw.hasPrefix("//") {
                  //       parsed.append(SourceLine(number: number, text: raw, kind: .comment))
                  //       continue
                  // }
                  if raw.hasPrefix("\tvoice_keysplit") {
                        let parts = raw.split(
                              maxSplits: 3, omittingEmptySubsequences: true,
                              whereSeparator: { $0 == " " })
                        if parts.count >= 2 {
                              var toVoice = parts[1]
                              if toVoice.hasSuffix(",") { toVoice = toVoice.dropLast() }
                              toVoice = toVoice.drop(while: { $0.isWhitespace })
                              while toVoice.last?.isWhitespace == true {
                                    toVoice = toVoice.dropLast()
                              }
                              let usingKeysplit: Substring? = parts.count > 2 ? parts[2] : nil
                              parsed.append(
                                    SourceLine(
                                          number: number, text: raw,
                                          kind: .voiceKeysplit(
                                                type: parts[0], target: toVoice,
                                                using: usingKeysplit)))
                              continue
                        }
                  }
                  parsed.append(SourceLine(number: number, text: raw, kind: .other))
            }

            return VoicegroupFile(id: id, path: url.path, lines: parsed)
      }
      static func main() {

            // defer {
            //       let elapsed = Date().timeIntervalSince(start) * 1000
            //       fputs(String(format: "Elapsed: %.1fms\n", elapsed), stderr)
            // }
            do {
                  TSMain.run(label: "voicegroup229")
                  return
                  //                  var i = 0
                  //                  while i < 1000 {
                  // Default demo path
                  // let rootfile = try String(
                  //       contentsOf: URL(
                  //             fileURLWithPath:
                  //                   "/Users/spencer/dev/nodeProjects/pokeemerald-expansion/sound/voicegroups/voicegroup229.inc",
                  //             isDirectory: false), encoding: .utf8)

                  // // Phase 1: Discover all voicegroup files and scan for keysplit targets
                  // let urls = try discoverVoicegroupFiles()
                  // var referencedTargets = Set<String>()
                  // for url in urls {
                  //       let file = try String(contentsOf: url, encoding: .utf8)
                  //       let keys = try lineStartsMatchingString(file: file)
                  //       for k in keys {
                  //             referencedTargets.insert(String(k.toVoicegroup))
                  //       }
                  // }

                  // // Phase 2: Parse referenced target files into hierarchical structure
                  // var groupsById = [VoicegroupID: VoicegroupFile]()
                  // for targetPath in referencedTargets {
                  //       let url = URL(fileURLWithPath: targetPath, isDirectory: false)
                  //       let group = try parseVoicegroup(url: url)
                  //       groupsById[group.id] = group
                  // }

                  // // Example: print summary counts
                  // for (id, group) in groupsById.sorted(by: { $0.key < $1.key }) {
                  //       let keysplitCount = group.lines.reduce(0) { acc, l in
                  //             if case .voiceKeysplit = l.kind { return acc + 1 }
                  //             return acc
                  //       }
                  //       print("\(id): lines=\(group.lines.count), keysplits=\(keysplitCount)")
                  // }
                  // //                        i += 1

            } catch {
                  print("Error", error)
            }
      }
      func tokenizeLines(lines: [Int]) {

      }

      static func lineStartsMatching(fileUrl: URL, prefix: String) throws -> Set<Int> {
            let data = try Data(contentsOf: fileUrl)
            let p = Array(prefix.utf8)
            if p.isEmpty { return [] }
            // let toReturn = Set<Int>()

            return data.withUnsafeBytes { raw in
                  guard let base = raw.baseAddress?.assumingMemoryBound(to: UInt8.self) else {
                        return []
                  }
                  return p.withUnsafeBytes { pRaw in
                        let pBase = pRaw.baseAddress!
                        var matches = Set<Int>()
                        var i = 0
                        var line = 1
                        var atLineStart = true

                        while i < raw.count {
                              var j = i
                              while j < raw.count {
                                    let b = base[j]
                                    if b == 0x20 || b == 0x09 {
                                          j += 1
                                          continue
                                    }
                                    break
                              }
                              if atLineStart && raw.count - i >= p.count {
                                    if base[j] == p[0]
                                          && memcmp(base.advanced(by: j), pBase, p.count) == 0
                                    {

                                          matches.insert(line)
                                    }
                              }
                              let byte = base[i]
                              if byte == 0x0A {  // '\n'
                                    line += 1
                                    atLineStart = true
                              } else {
                                    atLineStart = false
                              }
                              i += 1
                        }
                        return matches
                  }
            }
      }

}
