//
//  ConsoleProtocol.swift
//  VoicegroupParser
//
//  Created by Spencer on 9/25/25.
//

public enum ConsoleLevel: String, Encodable, Sendable {
  case fixable, bad
}

public protocol ConsoleProtocol: Encodable {
  var level: ConsoleLevel { get set }
  var message: String { get set }
}

public struct myConsoleProtocol: ConsoleProtocol, Sendable {
  public var level: ConsoleLevel
  public var message: String
  enum CodingKeys: String, CodingKey {
    case level, message
  }
///
  public init(message: String, level: ConsoleLevel) {
    self.message = message
    self.level = level
  }

//
//  public init(from decoder: any Decoder) throws {
//    let container = try decoder.container(keyedBy: CodingKeys.self)
//    self.level = try container.decode(ConsoleLevel.self, forKey: .level)
//    self.message = try container.decode(String.self, forKey: .message)
//  }
///
  public func encode(to encoder: any Encoder) throws {
    var container = encoder.container(keyedBy: CodingKeys.self)
    try container.encode(level, forKey: .level)
    try container.encode(message, forKey: .message)
  }
  //  public init(level: ConsoleLevel, message: String) {
  //    self.level = level
  //    self.message = message
  //  }

}
