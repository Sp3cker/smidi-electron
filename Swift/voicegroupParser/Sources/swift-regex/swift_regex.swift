import Foundation
@preconcurrency import RegexBuilder

typealias Bytes = Substring.UTF8View

struct KeySplitTableDefinition {
  let name: String
  let offset: Int
  let comment: String?
}
struct ByteValue {
  let value: UInt8
  let noteNumber: Int?
}
struct KeySplitTable {
  let definition: KeySplitTableDefinition
  // let byteLines: [UInt8]
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
    Anchor.endOfLine
  }

}
private let rx = Regexes()

struct SwiftRegexParsers {
  // Regex pattern for comment lines starting with @

  // Function to parse comments from the beginning of a file
  @inlinable static func parseComments(_ input: String) -> [String] {
    let lines = input.split(separator: "\n", omittingEmptySubsequences: false)
    var comments: [String] = []

    for line in lines {
      if let match = line.firstMatch(of: rx.commentLine) {
        comments.append(String(match.1))
      } else if !line.trimmingCharacters(in: .whitespaces).isEmpty {
        // Stop at first non-comment, non-empty line
        break
      }
    }

    return comments
  }
  // Names scan without splitting:
  @inlinable static func parseTableNames(_ input: String) -> [String] {
    input.matches(of: rx.tableName).map { String($0.1) }
  }
  // // Function to parse table names
  // static func parseTableNames(_ input: String) -> [String] {
  //   let lines = input.split(separator: "\n", omittingEmptySubsequences: false)
  //   var tableNames: [String] = []

  //   for line in lines {
  //     if let match = line.firstMatch(of: tableNameRegex) {
  //       tableNames.append(String(match.1))
  //     }
  //   }

  //   return tableNames
  // }

  // Function to parse a complete table definition
  static func parseTable(_ input: String, tableName: String) -> KeySplitTable? {
    let lines = input.split(separator: "\n", omittingEmptySubsequences: false)
    var definition: KeySplitTableDefinition?

    for line in lines {
      // Look for the table definition

      if let match = line.firstMatch(of: rx.tableDefinition) {
        let capturedTableNum = match.1
        let capturedOffset = match.2
        let comment = match.3.map { String($0) }

        if "KeySplitTable\(capturedTableNum)" == tableName {
          definition = KeySplitTableDefinition(
            name: tableName,
            offset: capturedOffset,
            comment: comment
          )
          break  // Found the table, can stop looking
        }
      }
    }

    guard let definition = definition else { return nil }
    return KeySplitTable(definition: definition)
  }

  // Function to parse all tables in a file
  @inlinable static func parseAllTables(_ input: String) -> [KeySplitTable] {
    let tableNames = parseTableNames(input)
    var tables: [KeySplitTable] = []

    for tableName in tableNames {
      if let table = parseTable(input, tableName: tableName) {
        tables.append(table)
      }
    }

    return tables
  }

  // Function to parse the complete file
  static func parseFile(_ input: String) -> KeySplitTablesFile {
    var tables = [KeySplitTable] = []
    var tablesStarted = false

  var currentName: String?
  var currentOffset = 0
  var currentComment: String?
  var currentBytes: [UInt8] = []
  currentBytes.reserveCapacity(128)

    for line in input.split(separator: "\n", omittingEmptySubsequences: true) {
      if !tablesStarted {
        if line.first === "@" {
          continue
        } else {
          tablesStarted = true
        }
      }

      if let m = line.firstMatch(of: rx.tableName) {
        if let name = currentName {
          let def = KeySplitTableDefinition(name: )
        }
      }

      
    }
    // let comments = parseComments(input)
    let tables = parseAllTables(input)

    return KeySplitTablesFile(tables: tables)
  }

  // Main parsing function that mimics the original parser's functionality
  static func parseTableNamesFromBytes(_ input: String) -> [String] {
    return parseTableNames(input)
  }

  // Convenient parsing methods
  static func parseTable(_ input: String) throws -> KeySplitTable {
    let tables = parseAllTables(input)
    guard let firstTable = tables.first else {
      throw NSError(
        domain: "SwiftRegexParsers", code: 1,
        userInfo: [NSLocalizedDescriptionKey: "No tables found in input"])
    }
    return firstTable
  }

  static func parseFileThrowing(_ input: String) throws -> KeySplitTablesFile {
    return parseFile(input)
  }
}
