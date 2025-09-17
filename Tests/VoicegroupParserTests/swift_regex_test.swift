import Foundation
import Testing

@testable import Keysplits
@testable import Voicegroups

public struct ParseBothResult {
  public let keysplit: Result<String, Error>
  public let voicegroup: Result<String, Error>
}
func parseBoth(kpath: String, root: String, vg: String) async -> ParseBothResult {
  // let k: Result<String, Error> = .success("skipped")

  async let k: Result<String, Error> = Task.detached {
    KeysplitParser.parseFile(kpath)
  }
  .value
  async let v: Result<String, Error> = Task.detached {
    await Voicegroup.parseVoicegroupFile(rootDir: root, voicegroup: vg)
  }.value

  return ParseBothResult(keysplit: await k, voicegroup: await v)
}
struct SwiftRegexTest {
  @Test func testKeysplitsParsing() async throws {
    var times: [CFTimeInterval] = []
    times.reserveCapacity(50)
    // var results: [String] = []
    defer {
      // Mean
      let mean = times.reduce(0, +) / Double(times.count)

      // Median
      let sortedTimes = times.sorted()
      let median: Double
      if sortedTimes.count % 2 == 0 {
        median = (sortedTimes[sortedTimes.count / 2 - 1] + sortedTimes[sortedTimes.count / 2]) / 2
      } else {
        median = sortedTimes[sortedTimes.count / 2]
      }

      // Mode (most frequent value, rounded to nearest millisecond)
      let roundedTimes = times.map { round($0) }
      let frequency = Dictionary(grouping: roundedTimes, by: { $0 })
      let mode = frequency.max(by: { $0.value.count < $1.value.count })?.key ?? 0

      print("📊 Execution Time Stats:")
      print("  Mean: \(String(format: "%.1f", mean))ms")
      print("  Median: \(String(format: "%.1f", median))ms")
      print("  Mode: \(String(format: "%.1f", mode))ms")
      print("  Min: \(String(format: "%.1f", sortedTimes.first ?? 0))ms")
      print("  Max: \(String(format: "%.1f", sortedTimes.last ?? 0))ms")
    }
    //    let start = CFAbsoluteTimeGetCurrent()
    //    defer {
    //      let elapsed = (CFAbsoluteTimeGetCurrent() - start) * 1000
    //      print("Elapsed: \(String(format: "%.1f", elapsed))ms")
    //    }
    let url =
      "/Users/spencer/dev/swiftProjects/voicegroupParser/keysplit_tables.inc"

    // Test the RegexBuilder implementation
    for _ in 0..<50 {
      let start = CFAbsoluteTimeGetCurrent()
      defer {
        let elapsed = (CFAbsoluteTimeGetCurrent() - start) * 1000
        times.append(elapsed)
        //                print("Elapsed: \(String(format: "%.1f", elapsed))ms")
      }

      let result = await parseBoth(
        kpath: url,
        root: "/Users/spencer/dev/nodeProjects/pokeemerald-expansion",
        vg: "voicegroup229"
      )
      // results.append(String(describing: result.voicegroup))
      //          print(result.voicegroup)
      #expect(true)
    }
    //      if let voicegroups = .success(result.voicegroup) {
    //
    //      }
    //      #expect(result.)
    //    switch result {
    //    case .success(let data):
    //
    //        #expect(data.voicegroup)
    //      print(result.voicegroup)
    //    case .failure(let error):
    //      print(error)
    //    }
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
