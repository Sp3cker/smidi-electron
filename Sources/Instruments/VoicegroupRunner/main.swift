import Config
import Console
import Dispatch
import Foundation
import Voicegroups

//
//Task {
try! await VoicegroupRunner.main()
//    exit(0)
//}
//dispatchMain()
private func computePopulationVariance(from values: [Double]) -> Double {

  guard !values.isEmpty else { return 0 }
  let mean = values.reduce(0, +) / Double(values.count)
  let sumSq = values.reduce(0) { $0 + ($1 - mean) * ($1 - mean) }
  return sumSq / Double(values.count)
}
private func computeSampleVariance(_ values: [Double]) -> Double {
  guard values.count > 1 else { return 0 }
  let mean = values.reduce(0, +) / Double(values.count)
  let sumSq = values.reduce(0) { $0 + ($1 - mean) * ($1 - mean) }
  return sumSq / Double(values.count - 1)
}
private func computeStdDev(fromVariance variance: Double) -> Double {
  return sqrt(variance)
}
@MainActor
struct VoicegroupRunner {

  static func main() async throws {
    fputs("vgparse starting...\n", stderr)
    //    let config = parseConfiguration()

    // Optional: allow giving Instruments / debugger time to attach.
    let env = ProcessInfo.processInfo.environment
    if let waitStr = env["VG_WAIT_ATTACH"], let seconds = UInt32(waitStr) {
      fputs(
        "[vgparse] PID \(getpid()) waiting \(seconds)s for attach...\n",
        stderr
      )
      sleep(seconds)
    }

    var timesMs: [Double] = []
    //    timesMs.reserveCapacity(config.iterations)
    var results: [Data] = []
    let homeDir = FileManager.default.homeDirectoryForCurrentUser
      .standardizedFileURL

    defer {
      if timesMs.isEmpty {
        fputs("No timing data collected.\n", stderr)
        exit(1)
      }

      let mean = timesMs.reduce(0, +) / Double(timesMs.count)
      let sorted = timesMs.sorted()
      let minVal = sorted.first ?? 0
      let maxVal = sorted.last ?? 0

      let frequency = Dictionary(grouping: timesMs, by: { $0 })
      let mode =
        frequency.max(by: { $0.value.count < $1.value.count })?.key ?? 0

      // let sampleStd = computeStdDev(
      //   fromVariance: computeSampleVariance(timesMs)
      // )
      print("📊 Execution Time Stats:")
      print("  Runs: \(timesMs.count)")
      print("  2nd run: \(timesMs[2])")
      //      print("  48nd run: \(timesMs[48])")
      print("  Mean: \(String(format: "%.1f", mean))ms")
      print("  Mode: \(String(format: "%.1f", mode))ms")
      print("  Min: \(String(format: "%.1f", minVal))ms")
      print("  Max: \(String(format: "%.1f", maxVal))ms")

      if let first = results.first {
        do {
          // let out = URL(
          //   fileURLWithPath: "/Users/spencer/dev/reactProjects/smidi-electron/"
          // )
          let out = homeDir.appending(path: "dev").appending(
            path: "reactProjects"
          ).appending(
            path: "smidi-electron"
          )
          let outURL =
            out
            .appendingPathComponent("results.json")
          try first.write(to: outURL, options: .atomic)
          print("Wrote example result to (\(outURL)) (\(first.count) bytes)")
        } catch {
          fputs("Error writing results.json: \(error)\n", stderr)
        }
      }
    }

    let defaultRoot =
      homeDir
      .appendingPathComponent("dev")
      .appendingPathComponent("nodeProjects")
      .appendingPathComponent("pokeemerald-expansion")
      .path
    let onError: @Sendable (any ConsoleProtocol) -> Void = { meme in
      print(meme)
    }
    do {
      let vg = Voicegroup(rootDir: defaultRoot, onError: onError)
      for _ in 0..<50 {
        let start = DispatchTime.now()
        let result: Data = try await vg.parseVoicegroupFile(
          voicegroup: "voicegroup229"
        )
        let end = DispatchTime.now()
        let nanos = end.uptimeNanoseconds - start.uptimeNanoseconds
        timesMs.append(Double(nanos) / 1_000_000)
        results.append(result)
      }
    } catch ParseError.malformedLine(let line, let reason) {
      let consoleError = ConsoleErrorMessage(message: reason, level: .fixable)
      onError(consoleError)

      // throw (consoleError)
    }

  }
}
