import Foundation
@preconcurrency import RegexBuilder

public struct KeySplitTable: Codable {
  public let name: String
  public let byteLines: [UInt8]
}

public struct KeySplitTablesFile: Codable {
  public let tables: [KeySplitTable]
}

// MOVED LETS INTO 'PRIVATE FINAL CLASS' TO OVERCOME CONCURRENCY ERRORS
// WHY THO?
// public struct Regexes: @unchecked Sendable {
//   let commentLine = Regex {
//     "@"
//     Capture {
//       OneOrMore(.anyNonNewline)
//     }
//   }
//   let tableDefinition = Regex {
//     ".set "
//     "KeySplitTable"
//     Capture {
//       OneOrMore(.digit)
//     } transform: {
//       Int($0)!
//     }
//     ", . - "
//     Capture {
//       OneOrMore(.digit)
//     } transform: {
//       Int($0)!
//     }
//     Optionally {
//       OneOrMore(.whitespace)
//       "@"
//       OneOrMore(.whitespace)
//       Capture { OneOrMore(.anyNonNewline) }
//     }
//   }

// }
///Scans consecutive decimal digits in a Substring starting at the given index,
//  builds the integer value, advances the index past those digits, and returns the number.
//  If the first character isn't a digit, it returns nil.

public struct KeysplitParser {
  // static let byteLine = Regex {
  //   Anchor.startOfLine
  //   "\t"
  //   ".byte"
  //   OneOrMore(.whitespace)
  //   Capture {
  //     OneOrMore(.digit)
  //   } transform: {
  //     UInt8($0)!
  //   }
  //   ZeroOrMore { .anyNonNewline }
  //   Anchor.endOfLine
  // }
  // @MainActor public static let tableName = Regex {
  //   Anchor.startOfLine
  //   ".set "
  //   "KeySplitTable"
  //   Capture {
  //     OneOrMore(.digit)
  //   }
  // }
  @inline(__always)
  static func parseLeadingUInt(from line: Substring, start: inout Substring.Index) -> Int? {
    var value = 0
    var began = false
    while start < line.endIndex, let v = line[start].wholeNumberValue {
      value = value * 10 + v
      began = true
      start = line.index(after: start)
    }
    return began ? value : nil
  }

  @inline(__always)
  static func parseByteLine(_ line: Substring) -> UInt8? {
    let prefix = "\t.byte"
    guard line.hasPrefix(prefix) else { return nil }
    var i = line.index(line.startIndex, offsetBy: prefix.count)
    // skip 1+ whitespace
    while i < line.endIndex, line[i].isWhitespace { i = line.index(after: i) }
    guard let n = parseLeadingUInt(from: line, start: &i), n <= 255 else { return nil }
    return UInt8(truncatingIfNeeded: n)
  }

  @inline(__always)
  static func parseTableHeader(_ line: Substring) -> String? {
    let prefix = ".set KeySplitTable"
    guard line.hasPrefix(prefix) else { return nil }
    var i = line.index(line.startIndex, offsetBy: prefix.count)
    guard let n = parseLeadingUInt(from: line, start: &i) else { return nil }
    return "KeySplitTable\(n)"
  }
  // Function to parse the complete file
  public static func parseFile(_ filePath: String) -> Result<String, Error> {
    do {
      let text = try String(
        contentsOf: URL(fileURLWithPath: filePath),
        encoding: .utf8)
      var tables: [KeySplitTable] = []
      var tablesStarted = false

      var currentName: String?
      var currentBytes: [UInt8] = []
      currentBytes.reserveCapacity(128)
      tables.reserveCapacity(60)

      for line in text.split(separator: "\n", omittingEmptySubsequences: true) {
        if !tablesStarted {
          if line.first == "@" {
            continue
          } else {
            tablesStarted = true
          }
        }

        if currentName != nil, let byte = parseByteLine(line) {
          currentBytes.append(byte)
          continue
        }
        if let name = parseTableHeader(line) {
          if let prev = currentName {
            tables.append(KeySplitTable(name: prev, byteLines: currentBytes))
          }
          currentName = name
          currentBytes.removeAll(keepingCapacity: true)
          continue
        }

      }

      if let name = currentName {
        let def = KeySplitTable(name: name, byteLines: currentBytes)
        tables.append(def)
      }
      return .success(
        try String(
          decoding: JSONEncoder().encode(KeySplitTablesFile(tables: tables)), as: UTF8.self))
    } catch let error {
      return .failure(error)
    }
  }

}
