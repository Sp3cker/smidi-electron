import Foundation
import Testing

@testable import Keysplits
@testable import Voicegroups

public struct ParseBothResult {
  public let keysplit: Result<String, Error>
  public let voicegroup: Result<String, Error>
}
func parseBoth(kpath: String, root: String, vg: String) async -> Result<ParseBothResult, Error> {
  async let k: Result<String, Error> = Task.detached { KeysplitParser.parseFile(kpath) }
    .value
  async let v: Result<String, Error> = Task.detached {
    await Voicegroup.parseVoicegroupFile(rootDir: root, voicegroup: vg)
  }.value

  return .success(ParseBothResult(keysplit: await k, voicegroup: await v))
}
struct SwiftRegexTest {
  @Test func testKeysplitsParsing() async throws {
    let start = CFAbsoluteTimeGetCurrent()
    defer {
      let elapsed = (CFAbsoluteTimeGetCurrent() - start) * 1000
      print("Elapsed: \(String(format: "%.1f", elapsed))ms")
    }
    let url = "/Users/spencer/dev/swiftProjects/voicegroupParser/keysplit_tables.inc"

    // Test the RegexBuilder implementation
    let result = await parseBoth(
      kpath: url, root: "/Users/spencer/dev/nodeProjects/pokeemerald-expansion",
      vg: "voicegroup229"
    )
    switch result {
    case .success(let result):
      print(type(of: result.keysplit))
      print(result.voicegroup)
    case .failure(let error):
      print(error)
    }
  }
  // @Test func parseVoicegroupFile_roundtrip() throws {
  //   let start = CFAbsoluteTimeGetCurrent()
  //   defer {
  //     let elapsed = (CFAbsoluteTimeGetCurrent() - start) * 1000
  //     print("Elapsed: \(String(format: "%.1f", elapsed))ms")
  //   }
  //   let root = "/Users/spencer/dev/nodeProjects/pokeemerald-expansion"
  //   let vg = "voicegroup229"
  //   switch Voicegroup.parseVoicegroupFile(rootDir: root, voicegroup: vg) {
  //   case .success(let json):
  //     #expect(!json.isEmpty)

  //   // optionally decode to validate shape:
  //   // struct Node: Decodable { let type: String }
  //   // _ = try JSONDecoder().decode(Node.self, from: Data(json.utf8))
  //   case .failure(let err):
  //     #expect(Bool(false), "parse failed: \(err)")
  //   }
  // }
  // Test parsing a specific table

}
