import Config
import Foundation

public enum ParseError: Error {
  case io(file: String, underlying: Error?)
  case malformedLine(line: String, reason: String)
  case noTables
  case validation(String)
}

public class Voicegroup {
  public var voiceGroup: String? = nil
  var rootDir: String
  public init(rootDir: String) {
    self.rootDir = rootDir
  }
  public func parseVoicegroupFile(voicegroup: String)
   throws -> Data
  {
    do {
      let parser = try Parser(rootDir: self.rootDir)
      let vgLabel = Substring(voicegroup)
      let root = try parser.resolveGroup(
        label: vgLabel,
      )
      let data = try JSONEncoder().encode(root)
      return data
    } catch {
      throw error
    }
  }

  fileprivate struct Square1Voice: Sendable, Encodable {
    let type = "square1"
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
    let type = "square2"
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
    let type = "noise"
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
    let type = "programwave"
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
    let type = "keysplit"
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
    let voicegroupLabel: Substring
    func encode(to encoder: Encoder) throws {
      var container = encoder.singleValueContainer()
      try container.encode(String(voicegroupLabel.utf8))
    }
  }
  fileprivate struct UnresolvedKeysplit: Sendable {
    let voicegroupLabel: Substring
    let keysplitLabel: Substring
    enum CodingKeys: CodingKey {
      case voicegroup, keysplit
    }
    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(
        String(voicegroupLabel.utf8),
        forKey: .voicegroup
      )
      try container.encode(String(keysplitLabel.utf8), forKey: .keysplit)
    }

  }

  fileprivate enum NodeKind: String, Sendable, Encodable {
    case group, keysplit, unresolvedKeysplit, directsound, programmable,
      square, noise, unknown
  }

  fileprivate struct GroupVoice: Sendable, Encodable {
    let type = "group"
    let voicegroup: Substring
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

  fileprivate struct SymbolMaps {
    let directSound: [String: String]
    let programmable: [String: String]
  }

  fileprivate struct Parser {
    let rootDir: URL
    let soundDir: URL
    let voicegroupsDir: URL
    let directSoundDataPath: URL
    let programmableWaveDataPath: URL

    let fileManager = FileManager.default

    private var symbols: SymbolMaps = SymbolMaps(
      directSound: [:],
      programmable: [:]
    )
    init(rootDir: String) throws {
      self.rootDir = URL(fileURLWithPath: rootDir)
      self.soundDir = self.rootDir.appendingPathComponent(
        "sound",
        isDirectory: true
      )
      self.voicegroupsDir = self.soundDir.appendingPathComponent(
        "voicegroups",
        isDirectory: true
      )
      self.directSoundDataPath = self.soundDir.appendingPathComponent(
        "direct_sound_data.inc",
        isDirectory: false
      )
      self.programmableWaveDataPath =
        self.rootDir.appendingPathComponent(
          "programmable_wave_data.inc",
          isDirectory: false
        )
      // self.symbols = try await preloadSymbols()
      // if self.symbols.directSound.isEmpty {
      //   throw ParseError.noTables
      // }

    }

    @inline(__always)
    fileprivate func parseLine(line: Substring)
      throws
      -> Node
    {
      do {
        guard let firstSpace: Substring.Index = line.firstIndex(of: " ")
        else {
          throw ParseError.malformedLine(
            line: String(line),
            reason: String("fuck")
          )
        }
        guard let firstUnderscore: Substring.Index = line.firstIndex(of: "_")
        else {
          throw ParseError.malformedLine(
            line: String(line),
            reason: String("fuck")
          )
        }
        let voiceType = line[firstUnderscore..<firstSpace].dropFirst()  // if we don't dropFirst, still has an underscore.

        if voiceType == "keysplit"
          || voiceType == "keysplit_all"
        {

          if isKeySplitVoicegroup(in: line) {
            return .unresolvedKeysplit(
              UnresolvedKeysplit(
                voicegroupLabel: line,
                keysplitLabel: line,
              )
            )
          } else {
            return .unresolvedVoicegroup(
              UnresolvedVoicegroup(
                voicegroupLabel: line,
              )
            )
          }
        }

        let parseableArgs = line[line.index(after: firstSpace)...]
        switch voiceType {
        case "directsound",
          "directsound_alt",
          "programmable_wave",
          "programmable_wave_alt":

          let args = try parseVoiceArguements(
            as:
              DirectSoundorPGMWaveVoiceArguements.self,
            from: parseableArgs
          )
          return .directsound(
            DirectSoundVoice(type: String(voiceType), voiceParams: args)
          )

        case "square_1",
          "square_1_alt":
          let args = try parseVoiceArguements(
            as: Square1VoiceArguements.self,
            from: parseableArgs
          )
          return .square1(
            Square1Voice(voiceParams: args)
          )
        case "square_2",
          "square_2_alt":
          let args = try parseVoiceArguements(
            as: Square2VoiceArguements.self,
            from: parseableArgs
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
                from: parseableArgs
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

    @inline(__always)
    fileprivate func voicegroupPath(label: Substring) -> URL {
      let digits = label.drop(while: { !$0.isNumber }).prefix(while: {
        $0.isNumber
      })
      return self.voicegroupsDir.appendingPathComponent(
        "voicegroup" + String(digits) + ".inc"
      )
    }

    fileprivate func parseVoicegroupFile(
      path: URL,

    ) throws
      -> [Node]
    {
      let tab = UInt8(ascii: "\t")

      let data = try Data(contentsOf: path, options: .mappedIfSafe)
        .withUnsafeBytes { raw in
          let lines = raw.split(
            separator: UInt8(ascii: "\n"),
            omittingEmptySubsequences: true
          ).filter { $0.first == tab }

          return lines.compactMap { slice -> String? in

            let s = String(decoding: slice, as: UTF8.self)
            guard !s.hasPrefix(".") else { return nil }

            return s.hasPrefix("\tvoice") ? s : nil
          }
        }

      return try data.map { raw in
        let line = Substring(raw)
        return try parseLine(line: line)
      }
    }

    fileprivate func resolveGroup(
      label: Substring
    ) throws -> Node {
      let path = voicegroupPath(label: label)
      var entries = try parseVoicegroupFile(
        path: path,
      )
      try resolveVoicegroupReference(from: &entries)

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
    fileprivate func isKeySplitVoicegroup(in line: Substring) -> Bool {
      let vgTypeLabel = line.prefix { $0 != " " }
      var c = 0
      for b in vgTypeLabel.utf8 {
        if b == UInt8(ascii: "_") {
          c += 1
          if c == 2 {
            return true
          }
        }
      }
      return false
    }

    fileprivate func resolveVoicegroupReference(from nodes: inout [Node])
      throws
    {
      for i in nodes.indices {
        switch nodes[i] {

        case .unresolvedKeysplit(let v):
          let referencedEntries = try parseVoicegroupFile(
            path: voicegroupPath(label: v.voicegroupLabel),
          )
          nodes[i] = .keysplit(
            KeysplitVoice(
              voicegroup: v.voicegroupLabel,
              keysplit: v.keysplitLabel,
              voices: referencedEntries
            )
          )
        case .unresolvedVoicegroup(let v):
          let referencedEntries = try parseVoicegroupFile(
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
  }
}
