import Foundation
@preconcurrency import RegexBuilder

// typealias Bytes = Substring.UTF8View

struct ByteValue {
  let value: UInt8
  let noteNumber: Int?
}
struct KeySplitTable {
  let name: String
  let byteLines: [UInt8]
}

struct KeySplitTablesFile {

  let tables: [KeySplitTable]
}

// MOVED LETS INTO 'PRIVATE FINAL CLASS' TO OVERCOME CONCURRENCY ERRORS
// WHY THO?
private final class Regexes: @unchecked Sendable {
  let commentLine = Regex {
    "@"
    Capture {
      OneOrMore(.anyNonNewline)
    }
  }
  let tableDefinition = Regex {
    ".set "
    "KeySplitTable"
    Capture {
      OneOrMore(.digit)
    } transform: {
      Int($0)!
    }
    ", . - "
    Capture {
      OneOrMore(.digit)
    } transform: {
      Int($0)!
    }
    Optionally {
      OneOrMore(.whitespace)
      "@"
      OneOrMore(.whitespace)
      Capture { OneOrMore(.anyNonNewline) }
    }
  }

  let tableName = Regex {
    Anchor.startOfLine
    ".set "
    "KeySplitTable"
    Capture {
      OneOrMore(.digit)
    }
    // transform: {
    //   "KeySplitTable\($0)"
    // }
  }
  let byteLine = Regex {
    Anchor.startOfLine
    "\t"
    ".byte"
    OneOrMore(.whitespace)
    Capture {
      OneOrMore(.digit)
    } transform: {
      UInt8($0)!
    }
    ZeroOrMore { .anyNonNewline }
    Anchor.endOfLine
  }

}
private let rx = Regexes()

struct SwiftRegexParsers {

  // Function to parse the complete file
  static func parseFile(_ input: String) -> KeySplitTablesFile {
    var tables: [KeySplitTable] = []
    var tablesStarted = false

    var currentName: String?
    var currentBytes: [UInt8] = []
    currentBytes.reserveCapacity(128)
    tables.reserveCapacity(60)

    for line in input.split(separator: "\n", omittingEmptySubsequences: true) {
      if !tablesStarted {
        if line.first == "@" {
          continue
        } else {
          tablesStarted = true
        }
      }

      if let m = line.firstMatch(of: rx.byteLine), currentName != nil {
        currentBytes.append(m.1)
        continue
      }
      if let m = line.firstMatch(of: rx.tableName) {
        if let name = currentName {
          let def = KeySplitTable(name: name, byteLines: currentBytes)
          tables.append(def)
        }
        currentName = "KeySplitTable\(m.1)"
        currentBytes.removeAll(keepingCapacity: true)
        continue
      }

    }

    if let name = currentName {
      let def = KeySplitTable(name: name, byteLines: currentBytes)
      tables.append(def)
    }
    return KeySplitTablesFile(tables: tables)
  }

  // // Main parsing function that mimics the original parser's functionality
  // static func parseTableNamesFromBytes(_ input: String) -> [String] {
  //   return parseTableNames(input)
  // }

  // // Convenient parsing methods
  // static func parseTable(_ input: String) throws -> KeySplitTable {
  //   let tables = parseAllTables(input)
  //   guard let firstTable = tables.first else {
  //     throw NSError(
  //       domain: "SwiftRegexParsers", code: 1,
  //       userInfo: [NSLocalizedDescriptionKey: "No tables found in input"])
  //   }
  //   return firstTable
  // }

  static func parseFileThrowing(_ input: String) throws -> KeySplitTablesFile {
    return parseFile(input)
  }
}
