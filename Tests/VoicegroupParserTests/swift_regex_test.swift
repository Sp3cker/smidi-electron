import Foundation
import Testing

@testable import Keysplits
@testable import Voicegroups

public struct ParseBothResult {
  public let keysplit: Result<String, Error>
  public let voicegroup: Result<Data, Error>
}
func parseBoth(kpath: String, root: String, vg: String) async -> ParseBothResult {
  let k: Result<String, Error> = .success("skipped")

  // async let k: Result<String, Error> = Task.detached {
  //   KeysplitParser.parseFile(kpath)
  // }
  // .value
  let v: Result<Data, Error> =
    await Voicegroup.parseVoicegroupFile(rootDir: root, voicegroup: vg)

  return ParseBothResult(keysplit: k, voicegroup: v)
}
struct SwiftRegexTest {
  @Test func testKeysplitsParsing() async throws {
    var times: [CFTimeInterval] = []
    times.reserveCapacity(50)
    var results: [String] = []
    defer {
      let mean = times.reduce(0, +) / Double(times.count)
      let sortedTimes = times.sorted()
      let median: Double
      if sortedTimes.count % 2 == 0 {
        median =
          (sortedTimes[sortedTimes.count / 2 - 1]
            + sortedTimes[sortedTimes.count / 2]) / 2
      } else {
        median = sortedTimes[sortedTimes.count / 2]
      }
      let roundedTimes = times.map { round($0) }
      let frequency = Dictionary(grouping: roundedTimes, by: { $0 })
      let mode =
        frequency.max(by: { $0.value.count < $1.value.count })?.key ?? 0

      print("📊 Execution Time Stats:")
      print("  Mean: \(String(format: "%.1f", mean))ms")
      print("  Median: \(String(format: "%.1f", median))ms")
      print("  Mode: \(String(format: "%.1f", mode))ms")
      print("  Min: \(String(format: "%.1f", sortedTimes.first ?? 0))ms")
      print("  Max: \(String(format: "%.1f", sortedTimes.last ?? 0))ms")
      print("example: \(String(describing: results.randomElement()))")
      print("size: \(String(describing: results.randomElement()!.lengthOfBytes(using: .utf8)))")
    }
    let url =
      "/Users/spencer/dev/swiftProjects/voicegroupParser/keysplit_tables.inc"

    let homeDir = FileManager.default.homeDirectoryForCurrentUser.path
    for _ in 0..<50 {
      let start = CFAbsoluteTimeGetCurrent()
      defer {
        let elapsed = (CFAbsoluteTimeGetCurrent() - start) * 1000
        times.append(elapsed)
      }
      // voicegroup128 is all voices, no keysplits, best test of algo
      let result = await parseBoth(
        kpath: url,
        root: homeDir + "/dev/nodeProjects/pokeemerald-expansion",
        // Use FileManager to get the current user's home directory in a platform-independent way.
        vg: "voicegroup229"
      )
      results.append(String(describing: result.voicegroup))
      //                print(result.voicegroup)
      #expect(true)
    }

  }

}
