// Precompiled, anchored line regexes
private static let setLine = Regex {
  Anchor.startOfLine
  ".set "
  "KeySplitTable"
  Capture { OneOrMore(.digit) } transform: { Int($0)! }
  ", . - "
  Capture { OneOrMore(.digit) } transform: { Int($0)! }
  Optionally {
    OneOrMore(.whitespace); "@"; OneOrMore(.whitespace)
    Capture { OneOrMore(.anyNonNewline) }
  }
  Anchor.endOfLine
}

private static let byteLine = Regex {
  Anchor.startOfLine
  "\t"; ".byte"; OneOrMore(.whitespace)
  Capture { OneOrMore(.digit) } transform: { UInt8($0)! }
  Optionally {
    OneOrMore(.whitespace); "@"; OneOrMore(.whitespace)
    Capture { OneOrMore(.digit) } transform: { Int($0)! }
  }
  Anchor.endOfLine
}

// Single pass
static func parseFile(_ input: String) -> KeySplitTablesFile {
  var comments: [String] = []
  var tables: [KeySplitTable] = []
  var seenNonComment = false

  var currentName: String?
  var currentOffset = 0
  var currentComment: String?
  var currentBytes: [UInt8] = []
  currentBytes.reserveCapacity(128)

  for line in input.lines {
    if !seenNonComment {
      if let m = line.firstMatch(of: Regex {
        Anchor.startOfLine; "@"; Capture { OneOrMore(.anyNonNewline) }; Anchor.endOfLine
      }) {
        comments.append(String(m.1)); continue
      }
      if line.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty == false {
        seenNonComment = true
      }
    }

    if let m = line.firstMatch(of: setLine) {
      if let name = currentName {
        let def = KeySplitTableDefinition(name: name, offset: currentOffset, comment: currentComment)
        tables.append(KeySplitTable(definition: def)) // attach bytes here if you add them
      }
      currentName = "KeySplitTable\(m.1)"
      currentOffset = m.2
      currentComment = m.3.map(String.init)
      currentBytes.removeAll(keepingCapacity: true)
      continue
    }

    if currentName != nil, let m = line.firstMatch(of: byteLine) {
      currentBytes.append(m.1)
      continue
    }
  }

  if let name = currentName {
    let def = KeySplitTableDefinition(name: name, offset: currentOffset, comment: currentComment)
    tables.append(KeySplitTable(definition: def))
  }

  return KeySplitTablesFile(comments: comments, tables: tables)
}