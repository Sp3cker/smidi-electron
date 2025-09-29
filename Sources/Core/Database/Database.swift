import Foundation
//
//  Database.swift
//  VoicegroupParser
//
//  Created by Spencer on 9/27/25.
//
import SQLite3

// Swift equivalents for SQLite destructor behaviors
private let SQLITE_STATIC = unsafeBitCast(0, to: sqlite3_destructor_type.self)
private let SQLITE_TRANSIENT = unsafeBitCast(-1, to: sqlite3_destructor_type.self)

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

public final class Database {
  private var db: OpaquePointer?

  // MARK: - Init / Deinit

  public init(path: String) throws {
    var handle: OpaquePointer?
    // SQLITE_OPEN_CREATE will create the DB file if it doesn't exist
    if sqlite3_open_v2(
      path, &handle, SQLITE_OPEN_CREATE | SQLITE_OPEN_READWRITE | SQLITE_OPEN_FULLMUTEX, nil)
      != SQLITE_OK
    {
      let message: String
      if let cstr = sqlite3_errmsg(handle) {
        message = String(cString: cstr)
      } else {
        message = "Unknown error"
      }
      sqlite3_close(handle)
      throw SQLiteError.openDatabase(message: message)
    }
    self.db = handle

    // Recommended pragmas
    try? execute("PRAGMA foreign_keys=ON;")
    try? execute("PRAGMA journal_mode=WAL;")
    try? execute("PRAGMA busy_timeout=5000;")  // 5s busy timeout
  }

  deinit {
    if db != nil {
      sqlite3_close(db)
    }
  }

  // MARK: - Public API

  public func execute(_ sql: String) throws {
    try execute(sql, with: [])
  }

  func execute(_ sql: String, with bindings: [SQLiteValue]) throws {
    let stmt = try prepare(sql)
    defer { sqlite3_finalize(stmt) }
    try bind(bindings, to: stmt)
    guard sqlite3_step(stmt) == SQLITE_DONE else {
      throw SQLiteError.execute(message: lastErrorMessage)
    }
  }

  // Returns rows as array of [String: SQLiteValue]
  public func query(_ sql: String, with bindings: [SQLiteValue] = []) throws -> [[String:
    SQLiteValue]]
  {
    let stmt = try prepare(sql)
    defer { sqlite3_finalize(stmt) }
    try bind(bindings, to: stmt)

    var rows: [[String: SQLiteValue]] = []
    let columnCount = sqlite3_column_count(stmt)

    while sqlite3_step(stmt) == SQLITE_ROW {
      var row: [String: SQLiteValue] = [:]
      for i in 0..<columnCount {
        let name = String(cString: sqlite3_column_name(stmt, i))
        row[name] = columnValue(stmt: stmt, column: i)
      }
      rows.append(row)
    }
    return rows
  }

  // MARK: - Helpers

  private func prepare(_ sql: String) throws -> OpaquePointer {
    var stmt: OpaquePointer?
    let rc = sqlite3_prepare_v2(db, sql, -1, &stmt, nil)
    guard rc == SQLITE_OK, let stmt else {
      throw SQLiteError.prepare(message: lastErrorMessage)
    }
    return stmt
  }

  private func bind(_ values: [SQLiteValue], to stmt: OpaquePointer) throws {
    for (index, value) in values.enumerated() {
      let idx = Int32(index + 1)  // SQLite parameters are 1-based
      let rc: Int32
      switch value {
        case .null:
          rc = sqlite3_bind_null(stmt, idx)
        case .int(let v):
          rc = sqlite3_bind_int64(stmt, idx, sqlite3_int64(v))
        case .double(let v):
          rc = sqlite3_bind_double(stmt, idx, v)
        case .text(let v):
          rc = sqlite3_bind_text(stmt, idx, v, -1, SQLITE_TRANSIENT)
        case .data(let v):
          rc = v.withUnsafeBytes { ptr in
            let base = ptr.bindMemory(to: UInt8.self).baseAddress
            return sqlite3_bind_blob(stmt, idx, base, Int32(v.count), SQLITE_TRANSIENT)
          }
      }
      guard rc == SQLITE_OK else {
        throw SQLiteError.bind(message: lastErrorMessage)
      }
    }
  }

  private func columnValue(stmt: OpaquePointer, column: Int32) -> SQLiteValue {
    let type = sqlite3_column_type(stmt, column)
    switch type {
      case SQLITE_INTEGER:
        return .int(Int(sqlite3_column_int64(stmt, column)))
      case SQLITE_FLOAT:
        return .double(sqlite3_column_double(stmt, column))
      case SQLITE_TEXT:
        if let cstr = sqlite3_column_text(stmt, column) {
          return .text(String(cString: cstr))
        } else {
          return .null
        }
      case SQLITE_BLOB:
        let bytes = sqlite3_column_blob(stmt, column)
        let count = Int(sqlite3_column_bytes(stmt, column))
        if let base = bytes, count > 0 {
          let data = Data(bytes: base, count: count)
          return .data(data)
        } else {
          return .data(Data())
        }
      case SQLITE_NULL:
        fallthrough
      default:
        return .null
    }
  }

  private var lastErrorMessage: String {
    if let cstr = sqlite3_errmsg(db) {
      return String(cString: cstr)
    } else {
      return "Unknown SQLite error"
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
