import Foundation
//
//  Database.swift
//  VoicegroupParser
//
//  Created by Spencer on 9/27/25.
//
import GRDB

enum SQLiteError: Error, CustomStringConvertible {
  case openDatabase(message: String)
  case prepare(message: String)
  case step(message: String)
  case bind(message: String)
  case execute(message: String)
  case unknown(message: String)

  var description: String {
    switch self {
      case .openDatabase(let message): return "SQLite Open Error: \(message)"
      case .prepare(let message): return "SQLite Prepare Error: \(message)"
      case .step(let message): return "SQLite Step Error: \(message)"
      case .bind(let message): return "SQLite Bind Error: \(message)"
      case .execute(let message): return "SQLite Execute Error: \(message)"
      case .unknown(let message): return "SQLite Unknown Error: \(message)"
    }
  }
}
// A Swift enum to represent SQLite bindable/returnable types
public enum SQLiteValue: Equatable {
  case null
  case int(Int)
  case double(Double)
  case text(String)
  case data(Data)
}

@MainActor
class Database {
public var dbQueue: DatabaseQueue
  public init() throws {
    self.dbQueue = try DatabaseQueue(path: "db.sqlite")
  }

}
// MARK: - Convenience: default app database path

extension Database {
  public static func defaultPath(fileName: String = "app.sqlite3") throws -> String {
    return URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
      //        let dir = try FileManager.default.url(
      //
      //        )
      .appending(path: "/smidi", directoryHint: .isDirectory)
      .appendingPathComponent(fileName)
      .path
  }
}
