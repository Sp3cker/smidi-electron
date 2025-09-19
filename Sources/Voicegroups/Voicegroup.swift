import Foundation

public enum ParseError: Error {
  case io(file: String, underlying: Error?)
  case malformedLine(line: String, reason: String)
  case noTables
  case validation(String)
}
public struct Voicegroup: Sendable, Encodable {

  init() {
    print("Voicegroup initialized")
  }
  public static func parseVoicegroupFile(rootDir: String, voicegroup: String)
    async -> Result<
      Data, Error
    >
  {
    do {
      let parser = try await Parser(rootDir: rootDir)
      let vgLabel = Substring(voicegroup)
      let root = try await parser.resolveGroup(
        label: vgLabel,
      )
      let data = try JSONEncoder().encode(root)
      return .success(data)
    } catch {
      return .failure(error)
    }
  }

  fileprivate struct ADSREnvelope: Sendable, Encodable {
    let envelope: [UInt8]
    init(args: [String]) {
      let lastFour = Array(args.suffix(4))
      self.envelope = [
        UInt8(lastFour[0]) ?? 0,
        UInt8(lastFour[1]) ?? 0,
        UInt8(lastFour[2]) ?? 0,
        UInt8(lastFour[3]) ?? 0,
      ]
    }
    func encode(to encoder: Encoder) throws {
      var container = encoder.singleValueContainer()
      try container.encode(envelope)
    }
  }
  fileprivate struct CommonVoiceParams: Sendable, Encodable {
    let envelope: ADSREnvelope
    let baseKey: UInt8
    let pan: UInt8
    // init()
    enum CodingKeys: CodingKey {
      case envelope, baseKey, pan
    }
    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(envelope, forKey: .envelope)
      try container.encode(baseKey, forKey: .baseKey)
      try container.encode(pan, forKey: .pan)
    }
  }
  fileprivate struct SquareVoice: Sendable, Encodable {
    let type = "square"
    let voiceParams: CommonVoiceParams
    let sweep: UInt8
    enum CodingKeys: CodingKey {
      case type, voiceParams, sweep
    }
    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(type, forKey: .type)
      try container.encode(voiceParams, forKey: .voiceParams)
      try container.encode(sweep, forKey: .sweep)
    }
  }

  fileprivate struct NoiseVoice: Sendable, Encodable {
    let type = "noise"
    let voiceParams: CommonVoiceParams
    let period: UInt8
    enum CodingKeys: CodingKey {
      case type, voiceParams, period
    }
    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(type, forKey: .type)
      try container.encode(voiceParams, forKey: .voiceParams)
    }
  }
  fileprivate struct PGMWaveVoice: Sendable, Encodable {
    let type = "programmable"
    let voiceParams: CommonVoiceParams
    let sample: String
    enum CodingKeys: CodingKey {
      case type, voiceParams, sample
    }
    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(type, forKey: .type)
      try container.encode(voiceParams, forKey: .voiceParams)
      try container.encode(sample, forKey: .sample)
    }
  }
  fileprivate struct DirectSoundVoice: Sendable, Encodable {
    let type = "directsound"
    let voiceParams: CommonVoiceParams
    let sample: String
    enum CodingKeys: CodingKey {
      case type, voiceParams, sample
    }
    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(type, forKey: .type)
      try container.encode(voiceParams, forKey: .voiceParams)
      try container.encode(sample, forKey: .sample)
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
      try container.encode(String(voicegroupLabel.utf8), forKey: .voicegroup)
      try container.encode(String(keysplitLabel.utf8), forKey: .keysplit)
    }

  }

  fileprivate enum NodeKind: String, Sendable, Encodable {
    case group, keysplit, unresolvedKeysplit, directsound, programmable,
      square, noise, unknown
  }

  fileprivate struct GroupVoice: Sendable, Encodable {
    let voicegroup: Substring
    let voices: [Node]

    enum CodingKeys: String, CodingKey {
      case voicegroup
      case voices
    }

    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(String(voicegroup), forKey: .voicegroup)
      try container.encode(voices, forKey: .voices)
    }
  }
  fileprivate enum Node: Sendable, Encodable {
    case keysplit(KeysplitVoice)
    case unresolvedKeysplit(UnresolvedKeysplit)
    case unresolvedVoicegroup(UnresolvedVoicegroup)
    case directsound(DirectSoundVoice)
    case programmable(PGMWaveVoice)
    case square(SquareVoice)
    case noise(NoiseVoice)
    case group(GroupVoice)
    func encode(to encoder: Encoder) throws {
      switch self {
      case .unresolvedKeysplit(let v): try v.encode(to: encoder)
      case .keysplit(let v): try v.encode(to: encoder)
      case .unresolvedVoicegroup(let v): try v.encode(to: encoder)
      case .directsound(let v): try v.encode(to: encoder)
      case .programmable(let v): try v.encode(to: encoder)
      case .square(let v): try v.encode(to: encoder)
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
    init(rootDir: String) async throws {
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

    // fileprivate func loadSymbolMap(_ filePath: URL) async throws -> [String:
    //   String]
    // {

    //   guard fileManager.fileExists(atPath: filePath.absoluteString) else {
    //     return [:]
    //   }
    //   guard
    //     let data = fileManager.contents(atPath: filePath.path),
    //     let text = String(data: data, encoding: .utf8)
    //   else { return [:] }

    //   var map: [String: String] = [:]
    //   var lastLabel: String? = nil
    //   for rawLine in text.split(
    //     separator: "\n",
    //     omittingEmptySubsequences: false
    //   ) {
    //     if let range = rawLine.range(of: "::") {
    //       let label = rawLine[..<range.lowerBound]
    //       let trimmed = label.trimmingCharacters(in: .whitespaces)
    //       if !trimmed.isEmpty { lastLabel = String(trimmed) }
    //       continue
    //     }
    //     if let incRange = rawLine.range(of: ".incbin") {
    //       let afterInc = incRange.upperBound
    //       if let startQuote = rawLine[afterInc...].firstIndex(
    //         of: "\""
    //       ) {
    //         let afterStart = rawLine.index(after: startQuote)
    //         if let endQuote = rawLine[afterStart...].firstIndex(
    //           of: "\""
    //         ) {
    //           let path = rawLine[afterStart..<endQuote]
    //           if let lbl = lastLabel {
    //             map[lbl] =
    //               self.rootDir.appendingPathComponent(
    //                 String(path)
    //               ).absoluteString
    //           }
    //           lastLabel = nil
    //         }
    //       }
    //     }
    //   }
    //   return map
    // }
    // fileprivate func preloadSymbols() async throws -> SymbolMaps {
    //   do {
    //     let ds = try await loadSymbolMap(directSoundDataPath)
    //     let pw = try await loadSymbolMap(programmableWaveDataPath)
    //     guard !ds.isEmpty || !pw.isEmpty else {
    //       throw ParseError.noTables
    //     }
    //     return SymbolMaps(directSound: ds, programmable: pw)
    //   } catch {
    //     throw error
    //   }
    // }

    // func voicegroupPath(label: String) -> URL {
    //   let digits = label.drop(while: { !$0.isNumber }).prefix(while: {
    //     $0.isNumber
    //   })
    //   return self.voicegroupsDir.appendingPathComponent(
    //     "voicegroup" + String(digits) + ".inc"
    //   )
    // }
    // voice_directsound 60, 0, DirectSoundWaveData_dp_woodbass_d3_16, 255, 251, 0, 171

    fileprivate func parseLine(line: Substring)
      async throws
      -> Node?
    {
      var i = line.startIndex
      while i < line.endIndex, line[i].isWhitespace {
        i = line.index(after: i)
      }
      guard i < line.endIndex else { return nil }

      guard let space: Substring.Index = line[i...].firstIndex(of: " ")
      else { return nil }
      let voiceType = line[i..<space]
      let argsStr = line[line.index(after: space)...].trimmingCharacters(
        in: .whitespaces
      )
      let rawArgs: [String] = argsStr.split(separator: ",").map {
        String($0.trimmingCharacters(in: .whitespaces))
      }

      if voiceType == "voice_keysplit"
        || voiceType == "voice_keysplit_all"
      {
        var first: String = rawArgs.first ?? ""
        if let cmntChar = first.lastIndex(of: "@") {
          first = String(first[..<cmntChar])
        }
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

      let envelope = ADSREnvelope(args: rawArgs)
      if voiceType.hasPrefix("voice_directsound") {
        let sample: String = rawArgs.count > 2 ? rawArgs[2] : ""
        // let asset = symbols.directSound[sample]
        return .directsound(
          DirectSoundVoice(
            voiceParams: CommonVoiceParams(
              envelope: envelope,
              baseKey: UInt8(rawArgs[0]) ?? 0,
              pan: UInt8(rawArgs[1]) ?? 0
            ),
            sample: sample,
          )
        )
      }
      if voiceType.hasPrefix("voice_programmable_wave") {
        let sample: String = rawArgs.count > 2 ? rawArgs[2] : ""
        // let asset = symbols.programmable[sample]
        return .programmable(
          PGMWaveVoice(
            voiceParams: CommonVoiceParams(
              envelope: envelope,
              baseKey: UInt8(rawArgs[0]) ?? 0,
              pan: UInt8(rawArgs[1]) ?? 0
            ),
            sample: sample,
          )
        )

      }
      if voiceType.hasPrefix("voice_square") {
        return .square(
          SquareVoice(
            voiceParams: CommonVoiceParams(
              envelope: envelope,
              baseKey: UInt8(rawArgs[0]) ?? 0,
              pan: UInt8(rawArgs[1]) ?? 0
            ),
            sweep: UInt8(rawArgs[2]) ?? 0,
          )
        )

      }
      if voiceType.hasPrefix("voice_noise") {
        return .noise(
          NoiseVoice(
            voiceParams: CommonVoiceParams(
              envelope: envelope,
              baseKey: UInt8(rawArgs[0]) ?? 0,
              pan: UInt8(rawArgs[1]) ?? 0
            ),
            period: UInt8(rawArgs[2]) ?? 0,
          )
        )
      }
      return nil
    }

    // fileprivate func readVoicegroupFile(path: URL) throws -> String {
    //   return try Data(contentsOf: path).withUnsafeBytes {
    //     String(decoding: $0, as: UTF8.self)
    //   }
    // }
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

    ) async throws
      -> [Node]
    {

      let data = try Data(contentsOf: path).withUnsafeBytes {
        $0.split(separator: UInt8(ascii: "\n"), omittingEmptySubsequences: true)
          .map { String(decoding: $0, as: UTF8.self) }
      }
      var nodes: [Node] = []
      nodes.reserveCapacity(128)
      for raw in data {
        let line = Substring(raw)
        guard line.hasPrefix("\tvoice_") else { continue }
        if let node = try await parseLine(line: line) {
          nodes.append(node)
        }
      }
      return nodes
    }

    fileprivate func resolveGroup(
      label: Substring
    ) async throws -> Node {
      let path = voicegroupPath(label: label)
      // let fileData = try readVoicegroupFile(path: path)
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
      async throws
    {
      for i in nodes.indices {
        switch nodes[i] {

        case .unresolvedKeysplit(let v):
          let referencedEntries = try await parseVoicegroupFile(
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

    // let validKeysplitVoiceTypes: Set<String> = [
    //   "voice_keysplit",
    //   "voice_keysplit_all",
    // ]
    // fileprivate
    //   func findKeysplitReference(in line: Substring) -> UnresolvedKeysplit?
    // {
    //   guard let space: Substring.Index = line.firstIndex(of: " ") else { return nil }
    //   let voiceType = line[..<space]
    //   if validKeysplitVoiceTypes.contains(String(voiceType)) {
    //     let argsStr = line[line.index(after: space)...].trimmingCharacters(
    //       in: .whitespaces
    //     )
    //     let rawArgs: [String] = argsStr.split(separator: ",").map {
    //       String($0.trimmingCharacters(in: .whitespaces))
    //     }
    //     var first: String = rawArgs.first ?? ""
    //     if let cmntChar = first.lastIndex(of: "@") {
    //       first = String(first[..<cmntChar])
    //     }
    //     return UnresolvedKeysplit(
    //       referencedVoicegroup: first,
    //       keysplit: nil
    //     )
    //   }
    // }
  }

}
