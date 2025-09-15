import Foundation
import Keysplits
import NodeAPI
import Voicegroups

public struct ParseBothResult {
  public let keysplit: Result<String, Error>
  public let voicegroup: Result<String, Error>
}
@inline(__always)
func parseBoth(root: String, vg: String) async -> (String, String) {
  let keysplitPath = root + "/sound/keysplit_tables.inc"

  do {
    async let k: Result<String, Error> = Task.detached { KeysplitParser.parseFile(keysplitPath) }
      .value
    async let v: Result<String, Error> = Task.detached {
      await Voicegroup.parseVoicegroupFile(rootDir: root, voicegroup: vg)
    }.value
    let vgResult: String
    let ksResult: String
    switch await k {
    case .success(let result):
      ksResult = result
    case .failure(let error):
      ksResult = error.localizedDescription
    }
    switch await v {
    case .success(let result):
      vgResult = result
    case .failure(let error):
      vgResult = error.localizedDescription
    }
    return (vgResult, ksResult)
  } catch {
    return (error.localizedDescription, error.localizedDescription)
  }
}
#NodeModule(exports: [

  "keysplit": try NodeFunction {
    (root: String, vg: String, callback: NodeFunction) async throws -> Void in
    do {

      let start = CFAbsoluteTimeGetCurrent()
      defer {
        let elapsed = (CFAbsoluteTimeGetCurrent() - start) * 1000
        print("Elapsed: \(String(format: "%.1f", elapsed))ms")
      }
      // Run both in parallel and await both results

      let results = await parseBoth(root: root, vg: vg)

      try callback([
        "keysplit": results.1,
        "voicegroup": results.0,
      ])

    } catch {

      try callback([String(describing: error)])
    }
  }
]
)
