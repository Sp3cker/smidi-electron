// Have to store "bookmarks" to access folders if
// user didn't select the folder via prompt.

import Foundation
import SmidiDatabase

enum BookmarkError: Error {
  case noBookmark
  case staleBookmark
  case badInstruction
  case noPathForBookmark
}
struct StoredBookmarks: Codable, Identifiable {
  var id: String
  var path: String
  var bookmarkBase64: String

}
//Database(path: Database.defaultPath)

public struct Bookmarks {
  //  nonisolated(unsafe) var db: Database? = nil
  //
  //  public nonisolated init(at path: String? = nil) async throws {
  //
  //
  //    self.db = try Database(
  //      path: try Database.defaultPath())
  //    try self.db?.execute(
  //      """
  //      CREATE TABLE IF NOT EXISTS bookmarks (
  //        id INTEGER PRIMARY KEY,
  //        path TEXT NOT NULL UNIQUE,
  //        bookmarkBase64 TEXT NOT NULL UNIQUE
  //         )
  //      """)
  //  }

  //  func loadBookmarks() throws -> [[String: SQLiteValue]] {
  //    guard let db = self.db else {
  //      throw NSError(
  //        domain: "Error", code: 1, userInfo: [NSLocalizedDescriptionKey: "Database not initialized"])
  //    }
  //    return try db.query("SELECT * FROM bookmarks")
  //  }

  //  public func getBookmark(for path: String) throws -> String {
  //    guard let db = self.db else {
  //      throw NSError(
  //        domain: "Error", code: 1, userInfo: [NSLocalizedDescriptionKey: "Database not initialized"])
  //    }
  //    let bookmark = try db.query(
  //      """
  //      SELECT * FROM bookmarks WHERE path = ?
  //      """,
  //      with: [.text(path)])
  //
  //    if bookmark.isEmpty == false {
  //      return try self.createBookmark(for: path)
  //    }
  //    debugPrint("Creating bookmark")
  //    return bookmark.flatMap { row in
  //      row.values.map { value in
  //        switch value {
  //          case .text(let s): return s
  //          case .int(let i): return String(i)
  //          case .double(let d): return String(d)
  //          case .data(let data): return data.base64EncodedString()
  //          case .null: return "NULL"
  //        }
  //      }
  //    }[0]
  //  }

  public static func createBookmark(for path: String) throws -> String {
    //    guard let db = self.db else {
    //      throw NSError(
    //        domain: "Error", code: 1, userInfo: [NSLocalizedDescriptionKey: "Database not initialized"])
    //    }
    let dirURL = URL(fileURLWithPath: path, isDirectory: true)
    var isDir: ObjCBool = false
    guard FileManager.default.fileExists(atPath: dirURL.path, isDirectory: &isDir), isDir.boolValue
    else {
      print("Directory missing")
      throw BookmarkError.noPathForBookmark
    }
    let url = URL(fileURLWithPath: path, isDirectory: true)
    let bookmark = try url.bookmarkData(options: .withSecurityScope).base64EncodedString()
    //    _ = try db.query(
    //      """
    //      INSERT INTO bookmarks (path, bookmarkBase64) VALUES(?, ?)
    //      """,
    //      with: [.text(path), .text(bookmark)]
    //    )
    return bookmark
  }

  public static func accessBookmark(base64: String) throws -> [String] {
    guard let data = Data(base64Encoded: base64) else {
      throw NSError(domain: "Error", code: 1, userInfo: nil)
    }
    var isStale = false
    let resolved = try URL(
      resolvingBookmarkData: data, options: .withSecurityScope, relativeTo: nil,
      bookmarkDataIsStale: &isStale)
    guard resolved.startAccessingSecurityScopedResource() else {
      throw BookmarkError.staleBookmark
    }
    return try FileManager.default.contentsOfDirectory(atPath: resolved.path)

  }

  func listContents(of base64Path: String) throws -> [String] {
    let contents = try Bookmarks.accessBookmark(base64: base64Path)
    return contents
  }

}
