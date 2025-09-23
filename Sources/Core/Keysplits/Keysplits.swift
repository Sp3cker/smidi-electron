import Foundation
import Sweep

public typealias KeysplitNoteRange = ClosedRange<UInt8>
public typealias VoiceSplits = [UInt8: [UInt8]]

public struct KeySplitTable: Codable {
  public let name: String
  public let offset: UInt8
}
public struct KeySplitWithVoices: Codable {
  public let table: KeySplitTable
  public let voices: VoiceSplits
}
public struct KeySplitTablesFile: Codable {
  public let tables: [KeySplitWithVoices]
}

// }
///Scans consecutive decimal digits in a Substring starting at the given index,
//  builds the integer value, advances the index past those digits, and returns the number.
//  If the first character isn't a digit, it returns nil.

public actor KeysplitParser {

  @inline(__always)
  static func parseLeadingUInt(
    from line: Substring,
    start: inout Substring.Index
  ) -> Int? {
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
    guard let n = parseLeadingUInt(from: line, start: &i), n <= 255 else {
      return nil
    }
    return UInt8(truncatingIfNeeded: n)
  }

  @inline(__always)
  static func parseTableHeader(_ line: Substring) -> KeySplitTable? {
    let prefix = ".set KeySplitTable"
    guard line.hasPrefix(prefix) else { return nil }
    var i = line.index(line.startIndex, offsetBy: prefix.count)
    guard let n = parseLeadingUInt(from: line, start: &i) else { return nil }
    //    var offset: UInt8? = nil
    //    let offsetMatcher = Matcher(
    //      identifiers: ["-"],
    //      terminators: ["\n"],
    //      allowMultipleMatches: false,
    //      handler: { substring, _ in
    //        offset = UInt8(substring.trimmingCharacters(in: .whitespaces))!
    //      }
    //    )
    let found = line.substrings(between: ["-"], and: [.end, "@"]).map {
      $0.trimmingCharacters(in: .whitespaces)
    }
    guard let offset = found.first else { return nil }
    //    if offset == nil { return nil }
    return KeySplitTable(name: "KeySplitTable\(n)", offset: UInt8(offset)!)
  }
  // Function to parse the complete file
  public static func parseFile(_ filePath: String) throws -> String {
    do {
      // let text = try String(
      //   contentsOf: URL(fileURLWithPath: filePath),
      //   encoding: .utf8)
      var tables: [KeySplitWithVoices] = []
      var bytesUnderTable:UInt8 = 0

      var currentTable: KeySplitTable?
      var currentBytes: [UInt8: [UInt8]] = [0: []]
      // currentBytes.reserveCapacity(128)
      tables.reserveCapacity(60)
      let data = try Data(
        contentsOf: URL(fileURLWithPath: filePath),
        options: .mappedIfSafe
      )
      .withUnsafeBytes { raw in
        let lines = raw.split(
          separator: UInt8(ascii: "\n"),
          omittingEmptySubsequences: true
        ).filter {
          $0.first != UInt8(ascii: "@")
        }

        return lines.compactMap { slice -> Substring? in

          var s = Substring(decoding: slice, as: UTF8.self)
          s.makeContiguousUTF8()
          return s
        }
      }
      for (index, line) in data.enumerated() {
        // if !tablesStarted {
        //   if line.first == UInt8(ascii: "@") {
        //     continue
        //   } else {
        //     tablesStarted = true
        //   }
        // }

        if currentTable != nil, let byte = parseByteLine(line) {
          bytesUnderTable += 1

          let valueToAppend = currentTable!.offset + bytesUnderTable
          currentBytes[byte, default: []].append(valueToAppend)
          continue
        }
        if let keysplitTable = parseTableHeader(line) {  // if we find a new table
          if let prev = currentTable {  // and we have a current table
            // wrap up, start parsing new table
            tables.append(KeySplitWithVoices(table: prev, voices: currentBytes))
          }
          currentTable = keysplitTable
          currentBytes.removeAll(keepingCapacity: true)
          bytesUnderTable = 0
          continue
        }

      }

      if let keysplitTable = currentTable {
        let def = KeySplitWithVoices(table: keysplitTable, voices: currentBytes)
        tables.append(def)
      }
      return
        try String(
          decoding: JSONEncoder().encode(KeySplitTablesFile(tables: tables)),
          as: UTF8.self
        )
    } catch let error {
      throw error
    }
  }

}
