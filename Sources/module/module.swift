import Config
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
    let onError = {
      print("hello")
    }
    instruments.onError(action: onError)

    //  try emit.call(["end"])
    // guard
    //     let eventsModule = try requireFn.dynamicallyCall(withArguments: ["node:events"]).as(NodeObject.self),
    //     let ctor = try eventsModule["EventEmitter"].as(NodeFunction.self)
    // else {
    //     throw ModuleError.eventEmitterMissing
    // }

    // let emitter = try ctor.construct(withArguments: [])
    // bridgeEmitter = emitter
    // return emitter
  },

  "init": try NodeFunction {
    (rootDir: String, callback: NodeFunction) async -> Void in
    do {
      await instruments.configure(rootDir: rootDir)
      print("init: success")
      // Emit event to Node listeners if available
      //      if let emitter = bridgeEmitter, let emitFn = try? emitter["emit"].as(NodeFunction.self) {
      //        _ = try? emitFn.call(this: emitter, withArguments: ["init:success", rootDir])
      //      }
      try callback([], true)
    } catch {
      //      if let emitter = bridgeEmitter, let emitFn = try? emitter["emit"].as(NodeFunction.self) {
      //        _ = try? emitFn.call(this: emitter, withArguments: ["init:error", error.localizedDescription])
      //      }
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
      //      if let emitter = bridgeEmitter, let emitFn = try? emitter["emit"].as(NodeFunction.self) {
      //        _ = try? emitFn.call(this: emitter, withArguments: ["keysplit:success", jsonString])
      //      }
      try callback([], jsonString)  // nil error, success data
    } catch {
      //      if let emitter = bridgeEmitter, let emitFn = try? emitter["emit"].as(NodeFunction.self) {
      //        _ = try? emitFn.call(this: emitter, withArguments: ["keysplit:error", error.localizedDescription])
      //      }
      // Avoid throwing from within error handling; best-effort callback
      try! callback([error.localizedDescription], [])  // error, nil data
    }
  },
]
)
