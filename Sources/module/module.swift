import Foundation
import Keysplits
import NodeAPI
import Voicegroups

public struct ParseBothResult {
  public let keysplit: Result<String, Error>
  public let voicegroup: Result<Data, Error>
}
@inline(__always)
func parseBoth(root: String, vg: String) async -> (String, String) {
  let keysplitPath = root + "/sound/keysplit_tables.inc"
  let k: Result<String, Error> = await KeysplitParser.parseFile(keysplitPath)
  let v: Result<Data, Error> = await Voicegroup.parseVoicegroupFile(rootDir: root, voicegroup: vg)

  let vgResult: String
  let ksResult: String
  switch k {
  case .success(let result):
    ksResult = result
  case .failure(let error):
    ksResult = error.localizedDescription
  }
  switch v {
  case .success(let result):
    vgResult = String(data: result, encoding: .utf8)!
  case .failure(let error):
    vgResult = error.localizedDescription
  }
  return (vgResult, ksResult)

}
#NodeModule(exports: [

  "keysplit": try NodeFunction {
    (root: String, vg: String, callback: NodeFunction) async -> Void in

    let results = await parseBoth(root: root, vg: vg)
    if .success(results) {
      try callback([
        "keysplit": results.1,
        "voicegroup": results.0,
      ])
    } else {
      try callback([String(describing: error)])
    }

  }
]
)
