import Common
import Foundation

public struct Voicegroup: Sendable, Encodable {

  public static func parseVoicegroupFile(rootDir: String, voicegroup: String)
    async -> Result<
      Data, Error
    >
  {
    do {
      let parser = try await Parser(rootDir: rootDir)
      let root = try await parser.resolveGroup(
        label: voicegroup,
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
  }
  fileprivate struct SquareVoice: Sendable, Encodable {
    let type: NodeKind = .square
    let voiceParams: CommonVoiceParams
    let sweep: UInt8
  }
  fileprivate struct NoiseVoice: Sendable, Encodable {
    let type: NodeKind = .noise
    let voiceParams: CommonVoiceParams
    let period: UInt8
  }
  fileprivate struct PGMWaveVoice: Sendable, Encodable {
    let type: NodeKind = .programmable
    let voiceParams: CommonVoiceParams
    let sample: String
  }
  fileprivate struct DirectSoundVoice: Sendable, Encodable {
    let type: NodeKind = .directsound
    let voiceParams: CommonVoiceParams
    let sample: String

  }
  fileprivate struct KeysplitVoice: Sendable, Encodable {
    let type: NodeKind = .keysplit
    let voicegroup: String
    let keysplit: String?
    let voices: [Node]?
  }
  fileprivate struct UnresolvedKeysplit: Sendable, Encodable {
    let type: NodeKind = .unresolvedKeysplit
    let referencedVoicegroup: String
    let keysplit: String?
  }
  fileprivate enum NodeKind: String, Sendable, Encodable {
    case group, keysplit, unresolvedKeysplit, directsound, programmable,
      square, noise, unknown
  }

  fileprivate struct GroupVoice: Sendable, Encodable {
    let voicegroup: String
    let voices: [Node]
  }

  fileprivate enum Node: Sendable, Encodable {

    case keysplit(KeysplitVoice)
    case unresolvedKeysplit(UnresolvedKeysplit)
    case directsound(DirectSoundVoice)
    case programmable(PGMWaveVoice)
    case square(SquareVoice)
    case noise(NoiseVoice)
    case group(GroupVoice)
    private enum CodingKeys: String, CodingKey { case type, value }
    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      switch self {
      case .unresolvedKeysplit(let v):
        try container.encode(NodeKind.unresolvedKeysplit, forKey: .type)
        try container.encode(v, forKey: .value)
      case .keysplit(let v):
        try container.encode(NodeKind.keysplit, forKey: .type)
        try container.encode(v, forKey: .value)
      case .directsound(let v):
        try container.encode(NodeKind.directsound, forKey: .type)
        try container.encode(v, forKey: .value)
      case .programmable(let v):
        try container.encode(NodeKind.programmable, forKey: .type)
        try container.encode(v, forKey: .value)
      case .square(let v):
        try container.encode(NodeKind.square, forKey: .type)
        try container.encode(v, forKey: .value)
      case .noise(let v):
        try container.encode(NodeKind.noise, forKey: .type)
        try container.encode(v, forKey: .value)
      case .group(let v):
        try container.encode(NodeKind.group, forKey: .type)
        try container.encode(v, forKey: .value)
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
    let prefetcher = FilePrefetcher()
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
        "/direct_sound_data.inc"
      )
      self.programmableWaveDataPath =
        self.rootDir.appendingPathComponent(
          "/programmable_wave_data.inc"
        )
      self.symbols = try await preloadSymbols()

    }

    fileprivate func loadSymbolMap(_ filePath: URL) async throws -> [String:
      String]
    {

      guard fileManager.fileExists(atPath: filePath.absoluteString) else {
        return [:]
      }
      guard
        let data = fileManager.contents(atPath: filePath.path),
        let text = String(data: data, encoding: .utf8)
      else { return [:] }

      var map: [String: String] = [:]
      var lastLabel: String? = nil
      for rawLine in text.split(
        separator: "\n",
        omittingEmptySubsequences: false
      ) {
        if let range = rawLine.range(of: "::") {
          let label = rawLine[..<range.lowerBound]
          let trimmed = label.trimmingCharacters(in: .whitespaces)
          if !trimmed.isEmpty { lastLabel = String(trimmed) }
          continue
        }
        if let incRange = rawLine.range(of: ".incbin") {
          let afterInc = incRange.upperBound
          if let startQuote = rawLine[afterInc...].firstIndex(
            of: "\""
          ) {
            let afterStart = rawLine.index(after: startQuote)
            if let endQuote = rawLine[afterStart...].firstIndex(
              of: "\""
            ) {
              let path = rawLine[afterStart..<endQuote]
              if let lbl = lastLabel {
                map[lbl] =
                  self.rootDir.appendingPathComponent(
                    String(path)
                  ).absoluteString
              }
              lastLabel = nil
            }
          }
        }
      }
      return map
    }
    fileprivate func preloadSymbols() async throws -> SymbolMaps {
      do {
        let ds = try await loadSymbolMap(directSoundDataPath)
        let pw = try await loadSymbolMap(programmableWaveDataPath)

        return SymbolMaps(directSound: ds, programmable: pw)
      } catch {
        throw error
      }
    }

    func voicegroupPath(label: String) -> URL {
      let digits = label.drop(while: { !$0.isNumber }).prefix(while: {
        $0.isNumber
      })
      return self.voicegroupsDir.appendingPathComponent(
        "voicegroup" + String(digits) + ".inc"
      )
    }

    fileprivate func parseLine(line: Substring)
      async throws
      -> Node?
    {
      var i = line.startIndex
      while i < line.endIndex, line[i].isWhitespace {
        i = line.index(after: i)
      }
      guard i < line.endIndex else { return nil }

      guard let space = line[i...].firstIndex(of: " ") else { return nil }
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

        // let file = try prefetcher.prefetch(
        //   from: voicegroupPath(label: first)
        // )

        // let nodes = try await parseVoicegroupFile(
        //   fileData: file
        // )

        return .unresolvedKeysplit(
          UnresolvedKeysplit(
            referencedVoicegroup: first,
            keysplit: nil,
          )
        )

      }
      let envelope = ADSREnvelope(args: rawArgs)
      if voiceType.hasPrefix("voice_directsound") {
        let sample: String = rawArgs.count > 2 ? rawArgs[2] : ""
        let asset = symbols.directSound[sample]
        return .directsound(
          DirectSoundVoice(
            voiceParams: CommonVoiceParams(
              envelope: envelope,
              baseKey: UInt8(rawArgs[0]) ?? 0,
              pan: UInt8(rawArgs[1]) ?? 0
            ),
            sample: asset ?? "",
          )
        )
      }
      if voiceType.hasPrefix("voice_programmable_wave") {
        let sample: String = rawArgs.count > 2 ? rawArgs[2] : ""
        let asset = symbols.programmable[sample]
        return .programmable(
          PGMWaveVoice(
            voiceParams: CommonVoiceParams(
              envelope: envelope,
              baseKey: UInt8(rawArgs[0]) ?? 0,
              pan: UInt8(rawArgs[1]) ?? 0
            ),
            sample: asset ?? "",
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
    fileprivate func readVoicegroupFile(path: URL) async throws -> String {
      do {
        async let data = Task(operation: {
          try String(contentsOf: path.absoluteURL, encoding: .utf8)
        }).value
        return try await data

      } catch {
        throw ParseError.io(file: path.path, underlying: error)
      }

    }
    fileprivate func parseVoicegroupFile(
      fileData: String,

    ) async throws
      -> [Node]
    {

      var nodes: [Node] = []
      nodes.reserveCapacity(128)
      for raw in fileData.split(separator: "\n") {
        guard raw.hasPrefix("\tvoice_") else { continue }
        if let node = try await parseLine(line: raw) {
          nodes.append(node)
        }
      }
      return nodes
    }

    fileprivate func resolveGroup(
      label: String
    ) async throws -> Node {
      let path = voicegroupPath(label: label)

      let fileData = try await readVoicegroupFile(path: path)
      var entries = try await parseVoicegroupFile(
        fileData: fileData,
      )
      try await resolveKeysplitReference(from: &entries)

      return .group(
        GroupVoice(
          voicegroup: label,
          voices: entries
        )
      )
    }

    fileprivate func resolveKeysplitReference(from nodes: inout [Node])
      async throws
    {
      for i in nodes.indices {
        if case .unresolvedKeysplit(let v) = nodes[i] {
          let referenced = try await readVoicegroupFile(
            path: voicegroupPath(label: v.referencedVoicegroup)
          )
          let referencedEntries = try await parseVoicegroupFile(
            fileData: referenced,
          )
          nodes[i] = .keysplit(
            KeysplitVoice(
              voicegroup: v.referencedVoicegroup,
              keysplit: v.keysplit,
              voices: referencedEntries
            )
          )
        }
      }
    }
  }
}
