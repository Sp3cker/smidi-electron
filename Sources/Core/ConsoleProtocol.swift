//
//  ConsoleProtocol.swift
//  VoicegroupParser
//
//  Created by Spencer on 9/25/25.
//

public enum ConsoleLevel: String, Encodable, Sendable {
  case fixable, bad
}

public protocol ConsoleProtocol: Sendable, Encodable {
  var level: ConsoleLevel { get set }
  var message: String { get set }
}

public struct ConsoleErrorMessage: ConsoleProtocol, Sendable, Encodable {
  public var level: ConsoleLevel
  public var message: String
  // Extra metadata to help JS side understand the error
  public var kind: String
  public var underlying: String?
  public var context: [String: String]? = nil

  public init(message: String, level: ConsoleLevel, kind: String = "Message", underlying: String? = nil, context: [String: String]? = nil) {
    self.message = message
    self.level = level
    self.kind = kind
    self.underlying = underlying
    self.context = context
  }

  public init(error: any Error, level: ConsoleLevel = .bad, message override: String? = nil, context: [String: String]? = nil) {
    self.level = level
    self.kind = String(reflecting: type(of: error))
    // Prefer explicit override, otherwise fall back to the error's description
    self.message = override ?? (error as? CustomStringConvertible)?.description ?? String(describing: error)
    self.underlying = nil
    self.context = context
  }
}
