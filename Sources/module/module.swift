import Bookmarks
import Config
import Console
import Foundation
import Instruments
import NodeAPI

public enum ModuleError: LocalizedError {
  case eventEmitterMissing

  public var errorDescription: String? {
    switch self {
      case .eventEmitterMissing:
        return "EventEmitter missing from Swift env."
    }
  }
}

public struct ParseBothResult {
  public let keysplit: Result<String, Error>
  public let voicegroup: Result<Data, Error>
}
let keysplit: String? = nil

let instruments = Instruments()
// nonisolated(unsafe) private var bridgeEmitter: NodeObject? = nil
#NodeModule(exports: [
  "bridgeConsole": try NodeFunction {
    (emit: NodeFunction) async throws -> Void in

    try emit.call(["start", "hello!!!"])

    for i in 0..<5 {
      try await Task.sleep(for: .seconds(2))

      try emit.call(["sensor1", "i"])
    }
    let onError: @Sendable (any ConsoleProtocol) -> Void = { console in
      Task { @NodeActor in
        do {

          try emit.call(["console:error", console.level.rawValue, console.message])

        } catch {
          print("Failed to emit console error: \(error)")
        }
      }
    }
    instruments.onError(onError)
  },

  "init": try NodeFunction {
    (rootDir: String, callback: NodeFunction) async -> Void in
    do {
      await instruments.configure(rootDir: rootDir)
      print("init: success")

      try callback([], true)
    } catch {

      try! callback([error.localizedDescription], [])
    }
  },

  "keysplit": try NodeFunction {
    (vg: String, callback: NodeFunction) async -> Void in
    do {
      let results = try await instruments.parseVoicegroupFile(label: vg)
      guard let jsonString = String(data: results, encoding: .utf8) else {
        try callback(["Failed to decode voicegroup data as UTF-8"], [])
        return
      }
      try callback([], jsonString)  // nil error, success data
    } catch {
      try! callback([error.localizedDescription], [])  // error, nil data
    }
  },
  "readProjectFolder": try NodeFunction {
    (midiFolder: String) async -> String? in
    do {
      
      let b64 = try  Bookmarks.createBookmark(for: midiFolder)
      print("swift \(b64)")
      return b64
    } catch {
      print(error)
      return nil  // error, nil data

    }
  },
]
)
