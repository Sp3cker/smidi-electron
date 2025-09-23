import Config
import Filesystem
import Foundation

public enum ParseError: Error {
  case io(file: String, underlying: Error?)
  case malformedLine(line: String, reason: String)
  case noTables
  case validation(String)
}

public actor Voicegroup {

  public var voiceGroup: String? = nil
  var rootDir: String
  fileprivate let parser: Parser
  public init(rootDir: String) {
    self.rootDir = rootDir
    self.parser = Parser(rootDir: self.rootDir)
  }
  public func parseVoicegroupFile(voicegroup: String)
    async throws -> Data
  {
    do {

      let root = try await self.parser.resolveGroup(
        label: voicegroup,
      )
      let data = try JSONEncoder().encode(root)
      return data
    } catch {
      throw error
    }
  }

  fileprivate struct Square1Voice: Sendable, Encodable {
    let type = "Square1"
    let voiceParams: Square1VoiceArguements
    enum CodingKeys: CodingKey {
      case type, voiceParams
    }
    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(voiceParams, forKey: .voiceParams)
      try container.encode(type, forKey: .type)
    }
  }
  fileprivate struct Square2Voice: Sendable, Encodable {
    let type = "Square2"
    let voiceParams: Square2VoiceArguements
    enum CodingKeys: CodingKey {
      case type, voiceParams
    }
    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(voiceParams, forKey: .voiceParams)
      try container.encode(type, forKey: .type)
    }
  }
  fileprivate struct NoiseVoice: Sendable, Encodable {
    let type = "Noise"
    let voiceParams: NoiseWaveVoiceArguements

    enum CodingKeys: CodingKey {
      case type, voiceParams
    }
    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(type, forKey: .type)
      try container.encode(voiceParams, forKey: .voiceParams)

    }
  }
  fileprivate struct PGMWaveVoice: Sendable, Encodable {
    let type = "Programwave"
    let voiceParams: DirectSoundorPGMWaveVoiceArguements

    enum CodingKeys: CodingKey {
      case type, voiceParams
    }
    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(type, forKey: .type)
      try container.encode(voiceParams, forKey: .voiceParams)

    }
  }
  fileprivate struct DirectSoundVoice: Sendable, Encodable {
    let type: String  // Keep variable because gets set in `parseLine`
    let voiceParams: DirectSoundorPGMWaveVoiceArguements

    enum CodingKeys: CodingKey {
      case type, voiceParams
    }
    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(type, forKey: .type)
      try container.encode(voiceParams, forKey: .voiceParams)

    }

  }
  fileprivate struct KeysplitVoice: Sendable, Encodable {
    let type = "Keysplit"
    let voicegroup: Substring
    let keysplit: Substring
    let voices: [Node]?
    enum CodingKeys: CodingKey {
      case type, voicegroup, keysplit, voices
    }
    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(type, forKey: .type)
      try container.encode(String(voicegroup.utf8), forKey: .voicegroup)
      try container.encode(String(keysplit.utf8), forKey: .keysplit)
      try container.encode(voices, forKey: .voices)
    }
  }
  fileprivate struct UnresolvedVoicegroup: Sendable {
    let voicegroupLabel: String
    func encode(to encoder: Encoder) throws {
      var container = encoder.singleValueContainer()
      try container.encode(voicegroupLabel)
    }
  }
  fileprivate struct UnresolvedKeysplit: Sendable {
    let voicegroupLabel: String
    let keysplitLabel: String
    let comment: String?
    enum CodingKeys: CodingKey {
      case voicegroup, keysplit, comment
    }
    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(
        voicegroupLabel,
        forKey: .voicegroup
      )
      try container.encode(keysplitLabel, forKey: .keysplit)
      try container.encode(comment, forKey: .comment)
    }

  }

  fileprivate enum NodeKind: String, Sendable, Encodable {
    case group, keysplit, unresolvedKeysplit, directsound, programmable,
      square, noise, unknown
  }

  fileprivate struct GroupVoice: Sendable, Encodable {
    let type = "Group"
    let voicegroup: String
    let voices: [Node]

    enum CodingKeys: String, CodingKey {
      case voicegroup
      case voices
      case type
    }

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(String(voicegroup), forKey: .voicegroup)
      try container.encode(voices, forKey: .voices)
      try container.encode(type, forKey: .type)
    }
  }
  fileprivate enum Node: Sendable, Encodable {
    case keysplit(KeysplitVoice)
    case unresolvedKeysplit(UnresolvedKeysplit)
    case unresolvedVoicegroup(UnresolvedVoicegroup)
    case directsound(DirectSoundVoice)
    case programmable(PGMWaveVoice)
    case square1(Square1Voice)
    case square2(Square2Voice)
    case noise(NoiseVoice)
    case group(GroupVoice)
    func encode(to encoder: Encoder) throws {
      switch self {
      case .unresolvedKeysplit(let v): try v.encode(to: encoder)
      case .keysplit(let v): try v.encode(to: encoder)
      case .unresolvedVoicegroup(let v): try v.encode(to: encoder)
      case .directsound(let v): try v.encode(to: encoder)
      case .programmable(let v): try v.encode(to: encoder)
      case .square1(let v): try v.encode(to: encoder)
      case .square2(let v): try v.encode(to: encoder)

      case .noise(let v): try v.encode(to: encoder)
      case .group(let v): try v.encode(to: encoder)
      }
    }
  }

  fileprivate struct Parser: Sendable {
    let rootDir: URL
    let soundDir: URL
    let voicegroupsDir: URL

    //    var fileMap: [String: URL]

    init(rootDir: String) {
      self.rootDir = URL(fileURLWithPath: rootDir)
      self.soundDir = self.rootDir.appendingPathComponent(
        "sound",
        isDirectory: true
      )
      self.voicegroupsDir = self.soundDir.appendingPathComponent(
        "voicegroups",
        isDirectory: true
      )

    }
    //    func secondDelimiter(in line: Substring, first char: Character, _ end: Character ) {
    //      var count = 0
    //      for index in line.indices
    //            if line[index] === char {count += 1}
    //      if count == 2 {
    //    }

    @inline(__always)
    fileprivate func parseLine(line: consuming Substring)
      throws
      -> Node
    {
      do {
        guard let firstUnderscore: Substring.Index = line.firstIndex(of: "_")
        else {
          throw ParseError.malformedLine(
            line: String(line),
            reason: String("fuck")
          )
        }
        let afterUnderscore = line.index(after: firstUnderscore)
        guard
          let firstSpaceRange = line.range(
            of: " ",
            range: afterUnderscore..<line.endIndex
          )
        else {
          throw ParseError.malformedLine(
            line: String(line),
            reason: "Missing first space after underscore"
          )
        }
        let firstSpace = firstSpaceRange.lowerBound

        //        guard let firstSpace: Substring.Index = line.(of: " ")
        //        else {
        //          throw ParseError.malformedLine(
        //            line: String(line),
        //            reason: String("fuck")
        //          )
        //        }

        let voiceType = line[firstUnderscore..<firstSpace].dropFirst()  // if we don't dropFirst, still has an underscore.

        let parseableArgs = line[line.index(after: firstSpace)...]

        if voiceType == "keysplit"
          || voiceType == "keysplit_all"
        {

          if isKeySplitAll(in: line) {

            return .unresolvedVoicegroup(
              UnresolvedVoicegroup(
                voicegroupLabel: try parseVoiceGroupUTF8(from: line),
              )
            )
          } else {
            let args = try parseVoiceArguements(
              as: KeysplitVoiceArguements.self,
              from: consume parseableArgs
            )

            return .unresolvedKeysplit(
              UnresolvedKeysplit(
                voicegroupLabel: args[0]!,
                keysplitLabel: args[1]!,
                comment: args[2]
              )
            )

          }
        }

        switch voiceType {
        case "directsound",
          "directsound_alt",
          "programmable_wave",
          "programmable_wave_alt":

          let args = try parseVoiceArguements(
            as:
              DirectSoundorPGMWaveVoiceArguements.self,
            from: consume parseableArgs
          )
          let type =
            switch voiceType {
            case "directsound", "directsound_alt":
              "DirectSound"
            case "programmable_wave", "programmable_wave_alt":
              "Programwave"
            default:
              throw ParseError.malformedLine(
                line: String(line),
                reason: String("fuck")
              )
            }
          return .directsound(
            DirectSoundVoice(type: type, voiceParams: args)
          )

        case "square_1",
          "square_1_alt":
          let args = try parseVoiceArguements(
            as: Square1VoiceArguements.self,
            from: consume parseableArgs
          )
          return .square1(
            Square1Voice(voiceParams: args)
          )
        case "square_2",
          "square_2_alt":
          let args = try parseVoiceArguements(
            as: Square2VoiceArguements.self,
            from: consume parseableArgs
          )
          return .square2(
            Square2Voice(voiceParams: args)
          )
        case "noise",
          "noise_alt":
          return .noise(
            NoiseVoice(
              voiceParams: try parseVoiceArguements(
                as: NoiseWaveVoiceArguements.self,
                from: consume parseableArgs
              )
            )
          )
        default:
          throw ParseError.malformedLine(
            line: String(line),
            reason: String("fuck")
          )
        }
      } catch {
        throw ParseError.malformedLine(
          line: String(line),
          reason: "Voice arguments parsing failed: \(error)"

        )
      }
    }

    fileprivate func resolveVoicegroupReference(from nodes: inout [Node])
      async throws
    {
      for i in nodes.indices {
        switch nodes[i] {

        case .unresolvedKeysplit(let v):
          let referencedEntries = try await parseVoicegroupFile(
            path: voicegroupPath(label: v.voicegroupLabel),
          )
          // let keysplit =
          nodes[i] = .keysplit(
            KeysplitVoice(
              voicegroup: Substring(v.voicegroupLabel),
              keysplit: Substring(v.keysplitLabel),
              voices: referencedEntries
            )
          )
        case .unresolvedVoicegroup(let v):
          let referencedEntries = try await parseVoicegroupFile(
            path: voicegroupPath(label: v.voicegroupLabel),
          )
          nodes[i] = .group(
            GroupVoice(
              voicegroup: v.voicegroupLabel,
              voices: referencedEntries
            )
          )
        default: continue
        }
      }
    }
    @inline(__always)
    fileprivate func voicegroupPath(label: String) throws -> URL {

      let path = self.voicegroupsDir.appending(
        component: label + ".inc",
        directoryHint: .notDirectory
      )
      return path
    }

    fileprivate func parseVoicegroupFile(
      path: URL,

    ) async throws
      -> [Node]
    {
      let tab = UInt8(ascii: "\t")
      let period = UInt8(ascii: ".")
      let data = try Data(contentsOf: path, options: .mappedIfSafe)
        .withUnsafeBytes { raw in
          let lines = raw.split(
            separator: UInt8(ascii: "\n"),
            omittingEmptySubsequences: true
          ).filter { $0.first == tab && $0.first != period }

          return lines.compactMap { slice -> Substring? in

            var s = Substring(decoding: slice, as: UTF8.self)
            s.makeContiguousUTF8()
            return s.hasPrefix("\tvoice") ? s : nil
          }
        }

      return try data.map { raw in

        return try parseLine(line: raw)
      }
    }

    fileprivate func resolveGroup(
      label: String
    ) async throws -> Node {
      let path = try voicegroupPath(label: label)
      var entries = try await parseVoicegroupFile(
        path: path,
      )
      try await resolveVoicegroupReference(from: &entries)

      return .group(
        GroupVoice(
          voicegroup: label,
          voices: entries
        )
      )
    }

    /**
     * Check if the voicegroup is a key split voicegroup false otherwise
     */
    @inline(__always)
    fileprivate func isKeySplitAll(in line: Substring) -> Bool {
      let vgTypeLabel = line.prefix { $0 != " " }
      let underscore = UInt8(ascii: "_")
      var c = 0
      for b in vgTypeLabel.utf8 {
        if b == underscore {
          c += 1
          if c == 2 {
            return true
          }
        }
      }
      return false
    }

  }
}
@_transparent
func parseVoiceGroupUTF8(from line: Substring) throws -> String {
  var components: [[UInt8]] = []
  var currentComponent: [UInt8] = []

  // Iterate over UTF-8 bytes
  for byte in line.utf8 {
    if byte == 32 || byte == 9 {  // Space (32) or tab (9)
      if !currentComponent.isEmpty {
        components.append(currentComponent)
        currentComponent = []
      }
    } else {
      currentComponent.append(byte)
    }
  }

  // Append the last component if non-empty
  if !currentComponent.isEmpty {
    components.append(currentComponent)
  }

  // Check if we have at least two components
  guard components.count >= 2 else {
    throw ParseError.validation(String(line))
  }

  // Convert the second component’s UTF-8 bytes to String
  return String(decoding: components[1], as: UTF8.self)
}

