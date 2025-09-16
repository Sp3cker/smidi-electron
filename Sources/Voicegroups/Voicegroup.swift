import Common
import Foundation

public struct Voicegroup: Sendable, Encodable {

  fileprivate enum VoicegroupRef: Sendable, Encodable {
    case pending(Task<[Node], Error>)
    case ready([Node])
    public func encode(to encoder: Encoder) throws {
      switch self {
      case .pending:
        // Skip encoding pending tasks
        break
      case .ready(let nodes):
        try nodes.encode(to: encoder)
      }
    }
  }

  public static func parseVoicegroupFile(rootDir: String, voicegroup: String) async -> Result<
    String, Error
  > {
    do {
      let parser = Parser(rootDir: rootDir)
      let symbols = parser.preloadSymbols()
      // var cache: [String: Node] = [:]
      var stack: Set<String> = []
      let root = try await parser.resolveGroup(
        label: voicegroup, symbols: symbols, stack: &stack)
      let data = try JSONEncoder().encode(root)
      return .success(String(data: data, encoding: .utf8)!)
    } catch {
      return .failure(error)
    }
  }

  fileprivate struct ADSREnvelope: Sendable, Encodable {
    let attack: UInt8
    let decay: UInt8
    let sustain: UInt8
    let release: UInt8
    init(args: [String]) {
      let lastFour = Array(args.suffix(4))
      self.attack = UInt8(lastFour[0]) ?? 0
      self.decay = UInt8(lastFour[1]) ?? 0
      self.sustain = UInt8(lastFour[2]) ?? 0
      self.release = UInt8(lastFour[3]) ?? 0
    }
  }

  fileprivate struct SquareVoice: Sendable, Encodable {
    let type: NodeKind = .square
    let envelope: ADSREnvelope
    let baseKey: UInt8
    let pan: UInt8
    let sweep: UInt8
  }
  fileprivate struct NoiseVoice: Sendable, Encodable {
    let type: NodeKind = .noise
    let envelope: ADSREnvelope
    let baseKey: UInt8
    let pan: UInt8
    let period: UInt8
  }
  fileprivate struct PGMWaveVoice: Sendable, Encodable {
    let type: NodeKind = .programmable
    let envelope: ADSREnvelope
    let baseKey: UInt8
    let sample: String
    let pan: UInt8
  }
  // MARK: - Models
  fileprivate struct DirectSoundVoice: Sendable, Encodable {
    let type: NodeKind = .directsound
    let envelope: ADSREnvelope
    let baseKey: UInt8
    let sample: String
    let pan: UInt8

  }
  fileprivate struct KeysplitVoice: Sendable, Encodable {
    let type: NodeKind = .keysplit
    let voicegroup: String
    let keysplit: String?
    let voices: VoicegroupRef?
  }

  public enum NodeKind: String, Sendable, Encodable {
    case group, keysplit, directsound, programmable, square, noise, unknown
  }

  fileprivate struct GroupVoice: Sendable, Encodable {
    let voicegroup: String
    let voices: VoicegroupRef
  }

  fileprivate enum Node: Sendable, Encodable {

    case keysplit(KeysplitVoice)
    case directsound(DirectSoundVoice)
    case programmable(PGMWaveVoice)
    case square(SquareVoice)
    case noise(NoiseVoice)
    case group(GroupVoice)
    private enum CodingKeys: String, CodingKey { case type, value }
    func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      switch self {
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
    // Why is a struct in an enum? Why GPT?
    let rootDir: String
    let soundDir: String
    let voicegroupsDir: String
    let directSoundDataPath: String
    let programmableWaveDataPath: String
    let prefetcher = FilePrefetcher()

    init(rootDir: String) {
      self.rootDir = rootDir
      self.soundDir = rootDir + "/sound"
      self.voicegroupsDir = soundDir + "/voicegroups"
      self.directSoundDataPath = soundDir + "/direct_sound_data.inc"
      self.programmableWaveDataPath = soundDir + "/programmable_wave_data.inc"
    }

    fileprivate func loadSymbolMap(_ filePath: String) -> [String: String] {
      guard FileManager.default.fileExists(atPath: filePath) else { return [:] }
      guard let text = try? String(contentsOfFile: filePath, encoding: .utf8) else { return [:] }
      var map: [String: String] = [:]
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
              if let lbl = lastLabel { map[lbl] = rootDir + "/" + String(path) }
              lastLabel = nil
            }
          }
        }
      }
      return map
    }

    fileprivate func preloadSymbols() -> SymbolMaps {
      let ds = loadSymbolMap(directSoundDataPath)
      let pw = loadSymbolMap(programmableWaveDataPath)
      return SymbolMaps(directSound: ds, programmable: pw)
    }

    func voicegroupPath(label: String) -> String {
      let digits = label.drop(while: { !$0.isNumber })
      let num = digits.prefix(while: { $0.isNumber })
      return voicegroupsDir + "/voicegroup" + String(num) + ".inc"
    }

    fileprivate func parseLine(line: String, symbols: SymbolMaps) -> Node? {
      var i = line.startIndex
      while i < line.endIndex, line[i].isWhitespace { i = line.index(after: i) }
      guard i < line.endIndex else { return nil }
      // guard line[i...].hasPrefix("voice_") else { return nil }
      guard let space = line[i...].firstIndex(of: " ") else { return nil }
      let voiceType = line[i..<space]
      let argsStr = line[line.index(after: space)...].trimmingCharacters(in: .whitespaces)
      let rawArgs: [String] = argsStr.split(separator: ",").map {
        String($0.trimmingCharacters(in: .whitespaces))
      }

      if voiceType == "voice_keysplit" || voiceType == "voice_keysplit_all" {
        var first: String = rawArgs.first ?? ""
        if let at = first.lastIndex(of: "@") { first = String(first[..<at]) }
        let dataTask: Task<[Node], Error> = Task.detached {
          () async throws -> [Node] in
          let fetchTask = await prefetcher.prefetch(
            from: URL(fileURLWithPath: voicegroupPath(label: first)))

          let nodes = try await parseVoicegroupFile(
            fileData: String(fetchTask.value), symbols: symbols)
          return nodes
        }
        return .keysplit(
          KeysplitVoice(
            voicegroup: first, keysplit: nil, voices: .pending(dataTask)))
      }
      let envelope = ADSREnvelope(args: rawArgs)
      if voiceType.hasPrefix("voice_directsound") {
        let sample: String = rawArgs.count > 2 ? rawArgs[2] : ""
        let asset = symbols.directSound[sample]
        return .directsound(
          DirectSoundVoice(
            envelope: envelope,
            baseKey: UInt8(rawArgs[0]) ?? 0,
            sample: asset ?? "",
            pan: UInt8(rawArgs[1]) ?? 0,
          ))
      }
      if voiceType.hasPrefix("voice_programmable_wave") {
        let sample: String = rawArgs.count > 2 ? rawArgs[2] : ""
        let asset = symbols.programmable[sample]
        return .programmable(
          PGMWaveVoice(
            envelope: envelope,
            baseKey: UInt8(rawArgs[0]) ?? 0,
            sample: asset ?? "",
            pan: UInt8(rawArgs[1]) ?? 0,
          ))

      }
      if voiceType.hasPrefix("voice_square") {
        return .square(
          SquareVoice(
            envelope: envelope,
            baseKey: UInt8(rawArgs[0]) ?? 0,
            pan: UInt8(rawArgs[1]) ?? 0,
            sweep: UInt8(rawArgs[2]) ?? 0,
          ))

      }
      if voiceType.hasPrefix("voice_noise") {
        return .noise(
          NoiseVoice(
            envelope: envelope,
            baseKey: UInt8(rawArgs[0]) ?? 0,
            pan: UInt8(rawArgs[1]) ?? 0,
            period: UInt8(rawArgs[2]) ?? 0,
          ))
      }
      return nil
    }
    fileprivate func readVoicegroupFile(path: String) throws -> String {
      do {
        return try String(contentsOfFile: path, encoding: .utf8)
      } catch {
        throw ParseError.io(file: path, underlying: error)
      }

    }
    fileprivate func parseVoicegroupFile(fileData: String, symbols: SymbolMaps) async throws
      -> [Node]
    {

      var nodes: [Node] = []
      nodes.reserveCapacity(128)
      var pendingVgs: [(index: Int, task: Task<[Node], Error>)] = []
      for raw in fileData.split(separator: "\n", omittingEmptySubsequences: true) {
        let trimmed = raw.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { continue }
        guard trimmed.hasPrefix("voice_") else { continue }
        if let node = parseLine(line: String(trimmed[...]), symbols: symbols) {
          if case .keysplit(let ks) = node, let voices = ks.voices, case .pending(let task) = voices
          {
            pendingVgs.append((index: nodes.count, task: task))
          }

          nodes.append(node)
        }
      }
      try await withThrowingTaskGroup(of: (Int, [Node]).self) { group in
        for (index, task) in pendingVgs {
          group.addTask { (index, try await task.value) }
        }
        while let (i, sub) = try await group.next() {
          if case .keysplit(let ks) = nodes[i] {
            nodes[i] = .keysplit(
              KeysplitVoice(
                voicegroup: ks.voicegroup,
                keysplit: ks.keysplit,
                voices: .ready(sub)
              )
            )
          }
        }
      }

      return nodes
    }

    fileprivate func resolveGroup(
      label: String, symbols: SymbolMaps, stack: inout Set<String>
    ) async throws -> Node {
      let path = voicegroupPath(label: label)
      let fileData = try readVoicegroupFile(path: path)
      let entries = try await parseVoicegroupFile(fileData: fileData, symbols: symbols)
      var children: [Node] = []
      children.reserveCapacity(entries.count)
      for node in entries {
        // if node.type == .keysplit, let sub = node.voicegroup {
        //   var localStack = stack
        //   let subnode = try resolveGroup(
        //     label: sub, symbols: symbols, cache: &cache, stack: &localStack)
        //   let merged = Node(
        //     type: .keysplit, voicegroup: node.voicegroup, voiceType: node.voiceType,
        //     params: node.params, sampleSymbol: nil, assetPath: nil, samples: subnode.samples)
        //   children.append(merged)
        // } else {
        children.append(node)
        // }
      }
      return .group(
        GroupVoice(
          voicegroup: label,
          voices: .ready(children)
        )
      )

    }
  }
}
