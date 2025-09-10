@preconcurrency import Parsing

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
}

struct KeySplitTablesFile {
  let comments: [String]
  let tables: [KeySplitTable]
}

struct KeySplitParsers {
  static let whitespace = Parse(input: Substring.self) {
    Many {
      OneOf {
        " "
        "\t"
      }
    }
  }

  static let optionalWhitespace = whitespace
  static let newline = Parse(input: Substring.self) {
    "\n"
  }

  static let commentLine = Parse(input: Substring.self) {
    "@"
    optionalWhitespace
    Rest().map(String.init)
  }

  static let commentLines = Parse(input: Substring.self) {
    Many {
      commentLine
    } separator: {
      newline
    }
  }

  static let tableName = Parse(input: Substring.self) {
    "KeySplitTable"
    Prefix { $0.isNumber || $0.isLetter }.filter { $0.isEmpty == false }
  }.map { "KeySplitTable" + String($0) }  // Returns full name?
  // static let tableName = Parse(input: Substring.self) {
  //   "KeySplitTable"
  //   Prefix { $0.isLetter || $0.isNumber }
  //     .filter { !$0.isEmpty }
  //     .map(String.init)
  // }.map { suffix in "KeySplitTable" + suffix }
  static let offsetValue = Parse(input: Substring.self) {
    Prefix { $0.isNumber }
      .filter { $0.isEmpty == false }
  }.map { Int($0!) }
}

// @preconcurrency import Parsing

// struct KeySplitTableDefinition {
//   let name: String
//   let offset: Int
//   let comment: String?
// }

// struct ByteValue {
//   let value: UInt8
//   let noteNumber: Int?
// }

// struct KeySplitTable {
//   let definition: KeySplitTableDefinition
//   let byteValues: [ByteValue]
// }

// struct KeySplitTablesFile {
//   let comments: [String]
//   let tables: [KeySplitTable]
// }

// struct KeySplitParsers {
//   static let whitespace = Parse<Substring, Void> {
//     Many(minimumCount: 0) {
//       OneOf {
//         " "
//         "\t"
//       }
//     }
//   }

//   static let optionalWhitespace = whitespace

//   static let newline = Parse<Substring, Void> {
//     "\n"
//   }

//   static let commentLine = Parse<Substring, String> {
//     "@"
//     optionalWhitespace
//     Rest().map(String.init)
//   }

//   static let commentLines = Parse<Substring, [String]> {
//     Many(minimumCount: 0) {
//       commentLine
//     } separator: {
//       newline
//     }
//   }

//   static let tableName = Parse<Substring, String> {
//     "KeySplitTable"
//     PrefixWhile { $0.isNumber || $0.isLetter }
//   }.map(String.init)

//   static let offsetValue = Parse<Substring, Int> {
//     PrefixWhile { $0.isNumber }
//   }.map { Int($0)! }

//   static let tableDefinition = Parse<Substring, KeySplitTableDefinition> {
//     ".set "
//     tableName
//     ", . - "
//     offsetValue
//     optionalWhitespace
//     Optionally {
//       "@"
//       optionalWhitespace
//       Rest().map(String.init)
//     }
//   }.map { name, offset, comment in
//     KeySplitTableDefinition(
//       name: name,
//       offset: offset,
//       comment: comment
//     )
//   }

//   static let byteValue = Parse<Substring, ByteValue> {
//     "\t.byte "
//     PrefixWhile { $0.isNumber }
//     optionalWhitespace
//     Optionally {
//       "@"
//       optionalWhitespace
//       PrefixWhile { $0.isNumber }
//     }
//   }.map { valueStr, noteNumberStr in
//     ByteValue(
//       value: UInt8(valueStr)!,
//       noteNumber: noteNumberStr.map { Int($0)! }
//     )
//   }

//   static let byteValues = Parse<Substring, [ByteValue]> {
//     Many(minimumCount: 0) {
//       byteValue
//     } separator: {
//       newline
//     }
//   }

//   static let keySplitTable = Parse<Substring, KeySplitTable> {
//     tableDefinition
//     newline
//     byteValues
//     Optionally {
//       newline
//     }
//   }.map { definition, values in
//     KeySplitTable(
//       definition: definition,
//       byteValues: values
//     )
//   }

//   static let keySplitTablesFile = Parse<Substring, KeySplitTablesFile> {
//     commentLines
//     newline
//     newline

//     Many(minimumCount: 0) {
//       keySplitTable
//     } separator: {
//       newline
//     }

//     Rest().map { _ in }
//   }.map { comments, tables in
//     KeySplitTablesFile(
//       comments: comments,
//       tables: tables
//     )
//   }
// }

// extension KeySplitParsers {
//   static func parseTable(_ input: String) throws -> KeySplitTable {
//     try keySplitTable.parse(input)
//   }

//   static func parseFile(_ input: String) throws -> KeySplitTablesFile {
//     try keySplitTablesFile.parse(input)
//   }
// }
