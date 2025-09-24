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
public enum KeySplitError: Error {
  case badTable(table: String)
}
let keytableMatch = "Ke".utf8

// }
///Scans consecutive decimal digits in a Substring starting at the given index,
//  builds the integer value, advances the index past those digits, and returns the number.
//  If the first character isn't a digit, it returns nil.
@inline(__always)
public func parseBetweenDelimiters(_ line: Substring, delimiters: [Character])
  throws -> String
{
  var args: [Substring] = []
  var cur = line.startIndex
  while cur < line.endIndex {
    if delimiters.contains(line[cur]) { break }
    // Skip leading whitespace

    //    while cur < line.endIndex && line[cur].isWhitespace {
    //      cur = line.index(after: cur)
    //    }
    if cur == line.endIndex {
      break
    }
    let start = cur  // Start of argument
    // Advance until delimiter or end
    while cur < line.endIndex && !delimiters.contains(line[cur]) {
      cur = line.index(after: cur)
    }
    var end = cur
    // Trim trailing whitespace
    while end > start && line[line.index(before: end)].isWhitespace {
      end = line.index(before: end)
    }
    if start < end {
      args.append(line[start..<end])
    }

  }
  return args.joined(separator: "")
}
public actor KeysplitParser {

  //  @inline(__always)
  //  static func parseLeadingUInt(
  //    from line: Substring,
  //    start: inout Substring.Index
  //  ) -> Int? {
  //    var value = 0
  //    var began = false
  //    while start < line.endIndex, line[start] != "@" {
  //      switch line[start].wholeNumberValue {
  //      case nil:
  //        return nil
  //      case let value?:
  //
  //      }
  //      value = value * 10 + v
  //      began = true
  //      start = line.index(after: start)
  //    }
  //    return began ? value : nil
  //  }

  @inline(__always)
  public static func parseByteValue(from line: Substring) -> Int? {
    let bytes = line.utf8
    var i = bytes.startIndex
    let end = bytes.endIndex

    // Scan for ".byte" anywhere in the line
    while i != end {
      // Look for '.'
      guard bytes[i] == 0x2E /* '.' */ else {
        i = bytes.index(after: i)
        continue
      }

      // Try to match "byte" after '.'
      var j = bytes.index(after: i)
      let expected: [UInt8] = [0x62, 0x79, 0x74, 0x65]  // "byte"
      var matched = true
      for b in expected {
        guard j != end, bytes[j] == b else {
          matched = false
          break
        }
        j = bytes.index(after: j)
      }
      if !matched {
        i = bytes.index(after: i)
        continue
      }

      // Skip spaces/tabs after ".byte"
      var k = j
      var sawSpace = false
      while k != end, bytes[k] == 0x20 /* ' ' */ || bytes[k] == 0x09 {
        sawSpace = true
        k = bytes.index(after: k)
      }
      guard sawSpace else { return nil }

      // Optional sign
      var sign = 1
      if k != end, bytes[k] == 0x2D /* '-' */ {
        sign = -1
        k = bytes.index(after: k)
      }

      // Parse digits
      var value = 0
      var parsed = false
      while k != end {
        let c = bytes[k]
        // Fast digit test: c in '0'...'9'
        if c &- 0x30 <= 9 {
          parsed = true
          value = value &* 10 &+ Int(c - 0x30)
          k = bytes.index(after: k)
        } else {
          break
        }
      }

      return parsed ? sign * value : nil
    }

    return nil
  }

  @inline(__always)
  static func parseTableHeader(_ line: Substring) throws -> KeySplitTable? {

    // Slice off the prefix

    // Expect format: "<name>, <offset>" possibly followed by a comment (e.g., "@ ...")
    guard let commaIndex = line.firstIndex(of: ",") else {
      throw KeySplitError.badTable(table: String(line))
    }

    // Name is everything before the comma
    let namePart = line[..<commaIndex]
    let name = String(namePart).trimmingCharacters(in: .whitespaces)

    // After the comma, parse the offset up to a comment or end of line
    let afterComma = line[line.index(after: commaIndex)...]
    guard let dashIndex = afterComma.firstIndex(of: "-") else {
      throw KeySplitError.badTable(table: String(line))
    }
    let afterDash = afterComma[afterComma.index(after: dashIndex)...]
    let byteOffsetSegment: Substring
    if let atIndex = afterDash.firstIndex(of: "@") {
      byteOffsetSegment = afterDash[..<atIndex]  // All
    } else {
      byteOffsetSegment = afterDash
    }
    let offsetString = String(byteOffsetSegment).trimmingCharacters(
      in: .whitespaces
    )
    guard let offset = UInt8(offsetString) else {
      throw KeySplitError.badTable(table: String(line))
    }

    return KeySplitTable(name: name, offset: offset)
  }

  public static func splitFileOnSet(data: consuming String) throws
    -> [[Substring]]

  {
    return data.split(separator: ".set ").map {

      return $0.split(
        separator: "\n",
        omittingEmptySubsequences: true
      )
      .filter { !$0.isEmpty && !$0.hasPrefix("@") }

    }.filter { !$0.isEmpty }
  }

  public static func parseKeysplitTableSubstring(_ tableSub: [Substring]) throws
    -> KeySplitWithVoices
  {
    guard tableSub[0].hasPrefix("Ke") else {
      throw KeySplitError.badTable(table: String(tableSub[0]))
    }
    //    if let table = tableSub[0].utf8.starts(with: keytableMatch) {
    guard let keysplitTable = try parseTableHeader(tableSub[0]) else {
      throw KeySplitError.badTable(table: String(tableSub[0]))
    }
    let parsedBytes: [Int?] = tableSub[1...].map { parseByteValue(from: $0) }
    var voiceSplits: VoiceSplits = [:]
    for (index, maybeByte) in parsedBytes.enumerated() {
      guard let intValue = maybeByte, intValue >= 0 && intValue <= 255 else { continue }
      let splitByte = UInt8(intValue)
      let byteOffset = UInt8(index) &+ keysplitTable.offset
      voiceSplits[splitByte, default: []].append(byteOffset)
    }
    return KeySplitWithVoices(table: keysplitTable, voices: voiceSplits)  }

  // Function to parse the complete file
  public static func parseFile(_ filePath: String) throws -> [KeySplitWithVoices] {
    //    do {

    var tables: [KeySplitWithVoices] = []
    var bytesUnderTable: UInt8 = 0

    var currentTable: KeySplitTable?
    var currentBytes: [UInt8: [UInt8]] = [0: []]
    // currentBytes.reserveCapacity(128)
    //    tables.reserveCapacity(60)
    let data = try String(
      contentsOf: URL(fileURLWithPath: filePath),
      encoding: .utf8
    )
    //      .withUnsafeBytes {
    //      $0.split(
    //        separator: UInt8(ascii: "\n"),
    //        omittingEmptySubsequences: true
    //      ).filter {
    //        $0.first != UInt8(ascii: "@")
    //      }
    //    }
    let sections = try splitFileOnSet(data: consume data)
    for table in sections {

      let keysplitTable = try parseKeysplitTableSubstring(table)
      tables.append(keysplitTable)
    }
    return tables

    //      for (index, line) in data.enumerated() {
    //
    //        switch line. {
    //        case ".":
    //          if let keysplitTable = parseTableHeader(line) {  // if we find a new table
    //            if let prev = currentTable {  // and we have a current table
    //              // wrap up, start parsing new table
    //              tables.append(
    //                KeySplitWithVoices(table: prev, voices: currentBytes)
    //              )
    //            }
    //            currentTable = keysplitTable
    //            currentBytes.removeAll(keepingCapacity: true)
    //            bytesUnderTable = 0
    //            continue
    //          }
    //        case ".":
    //          tableToLineNo.append(index)
    //          if currentTable != nil {
    //
    //          }
    //
    //        //              let byte = parseByteLine(line) {
    //        //            bytesUnderTable += 1
    //        //
    //        //            let valueToAppend = currentTable!.offset + bytesUnderTable
    //        //            currentBytes[byte, default: []].append(valueToAppend)
    //        //            continue
    //
    //        default:
    //          continue
    //        }
    //
    //      }
    //
    //      if let keysplitTable = currentTable {
    //        let def = KeySplitWithVoices(table: keysplitTable, voices: currentBytes)
    //        tables.append(def)
    //      }
    //      return
    //        try String(
    //          decoding: JSONEncoder().encode(KeySplitTablesFile(tables: tables)),
    //          as: UTF8.self
    //        )
    //        return String(decoding: line, as: UTF8.self)
    //      }
  }
}
