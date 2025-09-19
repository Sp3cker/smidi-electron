import Dispatch
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
    var times: [Double] = []
    times.reserveCapacity(50)
    var results: [Data] = []
    defer {
      let mean = times.reduce(0, +) / Double(times.count)
      let sortedTimes = times.sorted()
      let median: Double
      if sortedTimes.count % 2 == 0 {
        let midIndex = sortedTimes.count / 2
        let left = sortedTimes[midIndex - 1]
        let right = sortedTimes[midIndex]
        median = (left + right) / 2
      } else {
        median = sortedTimes[sortedTimes.count / 2]
      }

      let frequency = Dictionary(grouping: times, by: { $0 })
      let mode =
        frequency.max(by: { $0.value.count < $1.value.count })?.key ?? 0

      print("📊 Execution Time Stats:")
      print("  Mean: \(String(format: "%.1f", mean))ms")
      // print("  Median: \(String(format: "%.1f", results[0]))ms")
      print("  Mode: \(String(format: "%.1f", mode))ms")
      print("  Min: \(String(format: "%.1f", sortedTimes.first ?? 0))ms")
      print("  Max: \(String(format: "%.1f", sortedTimes.last ?? 0))ms")

      if results.isEmpty {
        print("No results to display.")
      } else {

        do {

          let url = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
            .appendingPathComponent("results.json")
          try results[0].write(to: url, options: .atomic)

        } catch {
          print("Error writing results to file: \(error)")
        }
        print("example: \(String(describing: results))")
      }
      // print("size: \(String(describing: results.randomElement()!.lengthOfBytes(using: .utf8)))")

    }
    let url =
      "/Users/spencer/dev/swiftProjects/voicegroupParser/keysplit_tables.inc"

    let homeDir = FileManager.default.homeDirectoryForCurrentUser
      .standardizedFileURL
    let projectPath = homeDir.appendingPathComponent("dev")
.appendingPathComponent(
        "pokeemerald-expansion"
      )

    for _ in 0..<50 {
      let start = DispatchTime.now()
      defer {
        let end = DispatchTime.now()
        let nanos = end.uptimeNanoseconds - start.uptimeNanoseconds
        let elapsed = Double(nanos) / 1_000_000
        times.append(elapsed)
      }
      // // voicegroup128 is all voices, no keysplits, best test of algo
      // let result = await parseBoth(
      //   kpath: url,
      //   root: projectPath.path,
      //   // Use FileManager to get the current user's home directory in a platform-independent way.
      //   vg: "voicegroup229"
      // )
      let v: Result<Data, Error> =
        await Voicegroup.parseVoicegroupFile(
          rootDir: projectPath.path,
          voicegroup: "voicegroup229"
        )
      if case .failure(let error) = v {
        throw error
      }
      if case .success(let vr) = v {

        results.append(vr)
      }
      //                print(result.voicegroup)
      #expect(true)
    }

  }

}
