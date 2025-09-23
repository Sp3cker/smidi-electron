import Config
import Foundation
import Instruments
import NodeAPI

public struct ParseBothResult {
  public let keysplit: Result<String, Error>
  public let voicegroup: Result<Data, Error>
}
let keysplit: String? = nil
//@inline(__always)
//func parseBoth(root: String, vg: String) throws -> Data {
//  // let keysplitPath = root + "/sound/keysplit_tables.inc"
//  // let k: Result<String, Error> = KeysplitParser.parseFile(keysplitPath)
//  let v: data Voicegroup.parseVoicegroupFile(
//    rootDir: root,
//    voicegroup: vg
//  )
//
//  switch v {
//  case .success(let result):
//    return result
//  case .failure(let error):
//    throw error
//  }
//  // let ksResult: String
//  // switch k {
//  // case .success(let result):
//  //   ksResult = result
//  // case .failure(let error):
//  //   ksResult = error.localizedDescription
//  // }
//
let instruments = Instruments()
#NodeModule(exports: [
  // "setConfig": try NodeFunction {
  //   (root: String, callback: NodeFunction) async -> Void in
  //   do {
  //     configActor = Config()
  //     await configActor.setRootDir(root: root)
  //    try callback([], [])
  //   } catch {

  //   }
  // },
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
  "voicegroup": try NodeFunction {

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
      // Avoid throwing from within error handling; best-effort callback
      try! callback([error.localizedDescription], [])  // error, nil data
    }
  },
]
)
