public protocol VoiceArguements {
  associatedtype Element
  static var expectedCount: Int { get }
  subscript(index: Int) -> Element { get set }
  init(parsed: [Substring]) throws
}

public enum VoiceArgsParseError: Error {
  case wrongCount(expected: Int, got: Int, voiceType: String)
  case invalidValue(index: Int, found: Substring)
}

/// A gaurenteed 7-length array of arguements
@inlinable
func parseUInt8(_ s: Substring, default def: UInt8 = 0) throws -> UInt8 {
  var v: UInt16 = 0
  var j = s.startIndex
  if j == s.endIndex { return def }
  while j < s.endIndex {
    guard let a = s[j].asciiValue, a >= 48, a <= 57 else { return def }
    v = v &* 10 &+ UInt16(a - 48)
    if v > 255 { return def }
    j = s.index(after: j)
  }
  return UInt8(v)
}
// MARK: - SQUAREVOICE
public struct Square1VoiceArguements: Sendable, Encodable {
  // 8-byte parameter tuple as implied by usage
  var params: (UInt8, UInt8, UInt8, UInt8, UInt8, UInt8, UInt8, UInt8)
  public init(params: (UInt8, UInt8, UInt8, UInt8, UInt8, UInt8, UInt8, UInt8))
  {
    self.params = params
  }
  public func encode(to encoder: Encoder) throws {
    var c = encoder.unkeyedContainer()
    try c.encode(params.0)
    try c.encode(params.1)
    try c.encode(params.2)
    try c.encode(params.3)
    try c.encode(params.4)
    try c.encode(params.5)
    try c.encode(params.6)
    try c.encode(params.7)
  }
}

/// 8 long
extension Square1VoiceArguements: VoiceArguements {
  public typealias Element = UInt8
  public static var expectedCount: Int { 8 }

  public init(parsed: [Substring]) throws {
    guard parsed.count >= Self.expectedCount else {
      throw VoiceArgsParseError.wrongCount(
        expected: Self.expectedCount,
        got: parsed.count,
        voiceType: String(describing: Self.self)
      )
    }
    func b(_ i: Int) throws -> UInt8 {
      do {
        let v = try parseUInt8(parsed[i], default: 255)
        return v
      } catch {
        throw VoiceArgsParseError.invalidValue(index: i, found: parsed[i])
      }
    }
    self.init(
      params: (
        try b(0), try b(1), try b(2), try b(3), try b(4), try b(5), try b(6),
        try b(7)
      )
    )
  }

  public subscript(_ position: Int) -> UInt8 {
    get {
      switch position {
      case 0: return params.0
      case 1: return params.1
      case 2: return params.2
      case 3: return params.3
      case 4: return params.4
      case 5: return params.5
      case 6: return params.6
      case 7: return params.7
      default: fatalError("Invalid voice arguement position: \(position)")
      }
    }
    set {
      switch position {
      case 0: params.0 = newValue
      case 1: params.1 = newValue
      case 2: params.2 = newValue
      case 3: params.3 = newValue
      case 4: params.4 = newValue
      case 5: params.5 = newValue
      case 6: params.6 = newValue
      case 7: params.7 = newValue
      default: fatalError("Invalid voice arguement position: \(position)")
      }
    }
  }
}
// MARK:- END SQUARE VOICE
public struct Square2VoiceArguements: Sendable, Encodable {
  // 8-byte parameter tuple as implied by usage
  var params: (UInt8, UInt8, UInt8, UInt8, UInt8, UInt8, UInt8)
  public init(params: (UInt8, UInt8, UInt8, UInt8, UInt8, UInt8, UInt8)) {
    self.params = params
  }
  public func encode(to encoder: Encoder) throws {
    var c = encoder.unkeyedContainer()
    try c.encode(params.0)
    try c.encode(params.1)
    try c.encode(params.2)
    try c.encode(params.3)
    try c.encode(params.4)
    try c.encode(params.5)
    try c.encode(params.6)

  }
}

/// 8 long
extension Square2VoiceArguements: VoiceArguements {
  public typealias Element = UInt8
  public static var expectedCount: Int { 7 }

  public init(parsed: [Substring]) throws {
    guard parsed.count >= Self.expectedCount else {
      throw VoiceArgsParseError.wrongCount(
        expected: Self.expectedCount,
        got: parsed.count,
        voiceType: String(describing: Self.self)
      )
    }
    func b(_ i: Int) throws -> UInt8 {
      do {
        let v = try parseUInt8(parsed[i], default: 255)
        return v
      } catch {
        throw VoiceArgsParseError.invalidValue(index: i, found: parsed[i])
      }
    }
    self.init(
      params: (
        try b(0), try b(1), try b(2), try b(3), try b(4), try b(5), try b(6)
      )
    )
  }

  public subscript(_ position: Int) -> UInt8 {
    get {
      switch position {
      case 0: return params.0
      case 1: return params.1
      case 2: return params.2
      case 3: return params.3
      case 4: return params.4
      case 5: return params.5
      case 6: return params.6
      default: fatalError("Invalid voice arguement position: \(position)")
      }
    }
    set {
      switch position {
      case 0: params.0 = newValue
      case 1: params.1 = newValue
      case 2: params.2 = newValue
      case 3: params.3 = newValue
      case 4: params.4 = newValue
      case 5: params.5 = newValue
      case 6: params.6 = newValue
      default: fatalError("Invalid voice arguement position: \(position)")
      }
    }
  }
}
// MARK: NOICE VOICE
struct NoiseWaveVoiceArguements: Sendable, Encodable {
  private var params: (UInt8, UInt8, UInt8, UInt8, UInt8, UInt8, UInt8)
  public static var expectedCount: Int { 7 }
  public func encode(to encoder: Encoder) throws {
    var c = encoder.unkeyedContainer()
    try c.encode(params.0)
    try c.encode(params.1)
    try c.encode(params.2)
    try c.encode(params.3)
    try c.encode(params.4)
    try c.encode(params.5)
    try c.encode(params.6)

  }
}

extension NoiseWaveVoiceArguements: VoiceArguements {
  public init(parsed: [Substring]) throws {
    guard parsed.count >= Self.expectedCount else {
      throw VoiceArgsParseError.wrongCount(
        expected: Self.expectedCount,
        got: parsed.count,
        voiceType: String(describing: Self.self)
      )
    }
    func b(_ i: Int) throws -> UInt8 {
      do {
        let v = try parseUInt8(parsed[i], default: 255)
        return v
      } catch {
        throw VoiceArgsParseError.invalidValue(index: i, found: parsed[i])
      }
    }
    self.init(
      params: (
        try b(0), try b(1), try b(2), try b(3), try b(4), try b(5), try b(6)
      )
    )
  }

  subscript(_ position: Int) -> UInt8 {
    get {
      switch position {
      case 0: return params.0
      case 1: return params.1
      case 2: return params.2
      case 3: return params.3
      case 4: return params.4
      case 5: return params.5
      case 6: return params.6
      default: fatalError("Invalid voice arguement position: \(position)")
      }
    }
    set {
      switch position {
      case 0: params.0 = newValue
      case 1: params.1 = newValue
      case 2: params.2 = newValue
      case 3: params.3 = newValue
      case 4: params.4 = newValue
      case 5: params.5 = newValue
      case 6: params.6 = newValue
      default: fatalError("Invalid voice arguement position: \(position)")
      }
    }
  }
}
// MARK: - DSPGM VOICE
public enum DSPGMVoiceArguementValue: Equatable {
  case none
}
public enum VoiceArguementValue: Equatable {
  // Works some magic down in the get/set
  case num(UInt8)
  case text(String)
}

public struct DirectSoundorPGMWaveVoiceArguements: VoiceArguements {
  //  public typealias Element = VoiceArguementValue
  public static var expectedCount: Int { 7 }

  // String param for 3rd (index 2)
  private var params: (UInt8, UInt8, String, UInt8, UInt8, UInt8, UInt8)

  public init(parsed: [Substring]) throws {
    // Make sure we got at least 8 params
    guard parsed.count >= Self.expectedCount else {
      throw VoiceArgsParseError.wrongCount(
        expected: Self.expectedCount,
        got: parsed.count,
        voiceType: String(describing: Self.self)
      )
    }
    func b(_ i: Int) throws -> UInt8 {
      do {
        let v = try parseUInt8(parsed[i], default: 255)
        return v
      } catch {
        throw VoiceArgsParseError.invalidValue(index: i, found: parsed[i])
      }
    }
    self.params = (
      try b(0), try b(1), String(parsed[2]), try b(3), try b(4), try b(5),
      try b(6)
    )
  }

  // Access to string at fixed index 2
  public var text: String {
    get { params.2 }
    set { params.2 = newValue }
  }

  // Unified subscript returning an enum for either numeric or text values
  public subscript(position: Int) -> VoiceArguementValue {
    get {
      switch position {
      case 0: return .num(params.0)
      case 1: return .num(params.1)
      case 2: return .text(params.2)
      case 3: return .num(params.3)
      case 4: return .num(params.4)
      case 5: return .num(params.5)
      case 6: return .num(params.6)
      default: fatalError("Invalid voice arguement position: \(position)")
      }
    }
    set {
      switch (position, newValue) {
      case (0, .num(let v)): params.0 = v
      case (1, .num(let v)): params.1 = v
      case (2, .text(let t)): params.2 = t
      case (3, .num(let v)): params.3 = v
      case (4, .num(let v)): params.4 = v
      case (5, .num(let v)): params.5 = v
      case (6, .num(let v)): params.6 = v
      default:
        fatalError(
          "Invalid voice arguement position or value type at index \(position)"
        )
      }
    }
  }
}

extension DirectSoundorPGMWaveVoiceArguements: Sendable, Encodable {
  public func encode(to encoder: Encoder) throws {
    var c = encoder.unkeyedContainer()
    try c.encode(params.0)
    try c.encode(params.1)
    try c.encode(params.2)
    try c.encode(params.3)
    try c.encode(params.4)
    try c.encode(params.5)
    try c.encode(params.6)
  }
}

struct KeysplitVoiceArguements: VoiceArguements {

  
  public static var expectedCount: Int { 3 }
  public typealias Element = String?
  private var params: (String, String, String?)

  public init(parsed: [Substring]) throws {
    // We need at least 2, maybe 3 if theres a comment
    guard parsed.count >= Self.expectedCount - 1 else {
      throw VoiceArgsParseError.wrongCount(
        expected: Self.expectedCount,
        got: parsed.count,
        voiceType: String(describing: Self.self)
      )
    }
    let comment = parsed.indices.contains(2) ? parsed[2] : nil

    self.params = (
      String(parsed[0]), String(parsed[1]), comment.map { String($0) }
    )
  }

  public subscript(position: Int) -> String? {
    get {
      switch position {
      case 0: return params.0
      case 1: return params.1
      case 2: return params.2
      default: fatalError("Invalid voice arguement position: \(position)")
      }
    }
    set {
      switch (position, newValue) {
      case (0, let v): params.0 = v!
      case (1, let v): params.1 = v!
      case (2, let v): params.2 = v
      default: fatalError("Invalid voice arguement position: \(position)")
      }
    }
  }
  
}
struct GroupVoiceArguements: VoiceArguements {
  public static var expectedCount: Int { 1 }
  public typealias Element = String
  private var params: String

  public init(parsed: [Substring]) throws {
    guard parsed.count == Self.expectedCount else {
      throw VoiceArgsParseError.wrongCount(
        expected: Self.expectedCount,
        got: parsed.count,
        voiceType: String(describing: Self.self)
      )
    }
    func b(_ i: Int) -> Substring { parsed[i] }
    self.params = String(b(0))
  }

  public subscript(position: Int) -> String {
    get {
      switch position {
      case 0: return params
      default: fatalError("Invalid voice arguement position: \(position)")
      }
    }
    set {
      switch position {
      case 0: params = newValue
      default: fatalError("Invalid voice arguement position: \(position)")
      }
    }
  }
}
@inline(__always)
public func parseVoiceArguements<A: VoiceArguements>(
  as type: A.Type,
  from line: consuming Substring
) throws -> A {
  var args: [Substring] = []
  args.reserveCapacity(8)

  var cur = line.startIndex
  while cur < line.endIndex {
    while cur < line.endIndex && line[cur].isWhitespace {
      cur = line.index(after: cur)  // loop through whitespace
    }
    if cur == line.endIndex { break }
    let start = cur  // start of argument
    while cur < line.endIndex && line[cur] != "," && line[cur] != "@" {
      cur = line.index(after: cur)
    }
    var end = cur
    // trim trailing ws
    while end > start && line[line.index(before: end)].isWhitespace {
      end = line.index(before: end)
    }
    if start < end {
      args.append(line[start..<end])
      if args.count == type.expectedCount { break }
    }
    if cur < line.endIndex {  // skip comma
      cur = line.index(after: cur)
    }
  }
  return try A(parsed: args)
}

//public func parseVoicegroupLabel(_ line: Substring) throws -> String {
//  var cur = line.startIndex
//  while cur < line.endIndex {
//    while cur < line.endIndex && line[cur].isWhitespace {
//      cur = line.index(after: cur)  // loop through whitespace
//    }
//    if cur == line.endIndex { break }
//    let start = cur  // start of argument
//    while cur < line.endIndex && line[cur] != "," {
//      cur = line.index(after: cur)
//    }
//    var end = cur
//    // trim trailing ws
//    while end > start && line[line.index(before: end)].isWhitespace {
//      end = line.index(before: end)
//    }
//    if start < end {
//      args.append(line[start..<end])
//    }
//    if cur < line.endIndex {  // skip comma
//      cur = line.index(after: cur)
//    }
//  }
//
//}
