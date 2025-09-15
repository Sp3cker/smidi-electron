import Common
import Foundation

public struct Voicegroup: Sendable {

  public enum VoicegroupRef: Sendable, Encodable {
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

  // MARK: - Models

  public enum NodeKind: String, Sendable, Encodable {
    case group, keysplit, directsound, programmable, square, noise, unknown
  }

  public struct Node: Sendable, Encodable {
    public let type: NodeKind
    public let voicegroup: String?
    public let voiceType: String?
    public let params: [String]?
    public let sampleSymbol: String?
    public let assetPath: String?
    public let samples: [Node]?
    public let subGroups: VoicegroupRef?

    public init(
      type: NodeKind,
      voicegroup: String?,
      voiceType: String?,
      params: [String]?,
      sampleSymbol: String?,
      assetPath: String?,
      samples: [Node]?,
      subGroups: VoicegroupRef?
    ) {
      self.type = type
      self.voicegroup = voicegroup
      self.voiceType = voiceType
      self.params = params
      self.sampleSymbol = sampleSymbol
      self.assetPath = assetPath
      self.samples = samples
      self.subGroups = subGroups
    }
  }

  struct SymbolMaps {
    let directSound: [String: String]
    let programmable: [String: String]
  }

  struct Parser {
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

    func loadSymbolMap(_ filePath: String) -> [String: String] {
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

    func preloadSymbols() -> SymbolMaps {
      let ds = loadSymbolMap(directSoundDataPath)
      let pw = loadSymbolMap(programmableWaveDataPath)
      return SymbolMaps(directSound: ds, programmable: pw)
    }

    func voicegroupPath(label: String) -> String {
      let digits = label.drop(while: { !$0.isNumber })
      let num = digits.prefix(while: { $0.isNumber })
      return voicegroupsDir + "/voicegroup" + String(num) + ".inc"
    }

    func parseLine(_ line: Substring, symbols: SymbolMaps) -> Node? {
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
        let dataTask: Task<[Node], Error> = Task.detached() {
          () async throws -> [Node] in
          let fetchTask = await prefetcher.prefetch(
            from: URL(fileURLWithPath: voicegroupPath(label: first)))

          let nodes = try await parseVoicegroupFile(
            fileData: String(fetchTask.value), symbols: symbols)
          return nodes
        }
        return Node(
          type: .keysplit, voicegroup: first, voiceType: String(voiceType), params: rawArgs,
          sampleSymbol: nil, assetPath: nil, samples: nil, subGroups: .pending(dataTask))
      }
      if voiceType.hasPrefix("voice_directsound") {
        let sample: String = rawArgs.count > 2 ? rawArgs[2] : ""
        let asset = symbols.directSound[sample]
        return Node(
          type: .directsound, voicegroup: nil, voiceType: String(voiceType), params: rawArgs,
          sampleSymbol: sample, assetPath: asset, samples: nil, subGroups: nil)
      }
      if voiceType.hasPrefix("voice_programmable_wave") {
        let sample: String = rawArgs.count > 2 ? rawArgs[2] : ""
        let asset = symbols.programmable[sample]
        return Node(
          type: .programmable, voicegroup: nil, voiceType: String(voiceType), params: rawArgs,
          sampleSymbol: sample, assetPath: asset, samples: nil, subGroups: nil)
      }
      if voiceType.hasPrefix("voice_square") {
        return Node(
          type: .square, voicegroup: nil, voiceType: String(voiceType), params: rawArgs,
          sampleSymbol: nil, assetPath: nil, samples: nil, subGroups: nil)
      }
      if voiceType.hasPrefix("voice_noise") {
        return Node(
          type: .noise, voicegroup: nil, voiceType: String(voiceType), params: rawArgs,
          sampleSymbol: nil, assetPath: nil, samples: nil, subGroups: nil)
      }
      return Node(
        type: .unknown, voicegroup: nil, voiceType: String(voiceType), params: rawArgs,
        sampleSymbol: nil, assetPath: nil, samples: nil, subGroups: nil)
    }
    func readVoicegroupFile(path: String) throws -> String {
      do {
        return try String(contentsOfFile: path, encoding: .utf8)
      } catch {
        throw ParseError.io(file: path, underlying: error)
      }

    }
    func parseVoicegroupFile(fileData: String, symbols: SymbolMaps) async throws -> [Node] {

      var nodes: [Node] = []
      nodes.reserveCapacity(128)
      var pendingVgs: [(index: Int, task: Task<[Node], Error>)] = []
      for raw in fileData.split(separator: "\n", omittingEmptySubsequences: true) {
        let trimmed = raw.trimmingCharacters(in: .whitespaces)
        if trimmed.isEmpty { continue }
        if !trimmed.hasPrefix("voice_") { continue }
        if let node = parseLine(trimmed[...], symbols: symbols) {
          if case .pending(let task) = node.subGroups {
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
          let n = nodes[i]
          nodes[i] = Voicegroup.Node(
            type: n.type,
            voicegroup: n.voicegroup,
            voiceType: n.voiceType,
            params: n.params,
            sampleSymbol: n.sampleSymbol,
            assetPath: n.assetPath,
            samples: n.samples,
            subGroups: .ready(sub)
          )
        }
      }

      return nodes
    }

    func resolveGroup(
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
      return Node(
        type: .group, voicegroup: label, voiceType: nil, params: nil, sampleSymbol: nil,
        assetPath: nil, samples: nil, subGroups: .ready(children))

    }
  }
}
