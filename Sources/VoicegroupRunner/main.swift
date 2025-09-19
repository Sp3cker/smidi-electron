import Foundation
import Dispatch

import Keysplits
import Voicegroups


struct VoicegroupRunner {
    static func main() async {
        let config = parseConfiguration()

        var timesMs: [Double] = []
        timesMs.reserveCapacity(config.iterations)
        var results: [Data] = []

        defer {
            if timesMs.isEmpty {
                fputs("No timing data collected.\n", stderr)
            }

            let mean = timesMs.reduce(0, +) / Double(timesMs.count)
            let sorted = timesMs.sorted()
            let minVal = sorted.first ?? 0
            let maxVal = sorted.last ?? 0

            let frequency = Dictionary(grouping: timesMs, by: { $0 })
            let mode = frequency.max(by: { $0.value.count < $1.value.count })?.key ?? 0

            print("📊 Execution Time Stats:")
            print("  Runs: \(timesMs.count)")
            print("  Mean: \(String(format: "%.1f", mean))ms")
            print("  Mode: \(String(format: "%.1f", mode))ms")
            print("  Min: \(String(format: "%.1f", minVal))ms")
            print("  Max: \(String(format: "%.1f", maxVal))ms")

            if let first = results.first {
                do {
                    let outURL = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
                        .appendingPathComponent("results.json")
                    try first.write(to: outURL, options: .atomic)
                    print("Wrote example result to results.json (\(first.count) bytes)")
                } catch {
                    fputs("Error writing results.json: \(error)\n", stderr)
                }
            }
        }

        for _ in 0..<config.iterations {
            let start = DispatchTime.now()
            let result: Result<Data, Error> = await Voicegroup.parseVoicegroupFile(
                rootDir: config.rootDir,
                voicegroup: config.voicegroup
            )
            let end = DispatchTime.now()
            let nanos = end.uptimeNanoseconds - start.uptimeNanoseconds
            timesMs.append(Double(nanos) / 1_000_000)

            switch result {
            case .success(let data):
                results.append(data)
            case .failure(let error):
                fputs("Parsing failed: \(error)\n", stderr)
                return
            }
        }
    }

    private static func parseConfiguration() -> Config {
        let args = CommandLine.arguments

        func value(after flag: String) -> String? {
            guard let idx = args.firstIndex(of: flag), idx + 1 < args.count else { return nil }
            return args[idx + 1]
        }

        let env = ProcessInfo.processInfo.environment
        let homeDir = FileManager.default.homeDirectoryForCurrentUser.standardizedFileURL

        // Defaults mirror the test
        let defaultRoot = homeDir
            .appendingPathComponent("dev")
            .appendingPathComponent("nodeProjects")
            .appendingPathComponent("pokeemerald-expansion")
            .path

        let root = value(after: "--root") ?? env["VG_ROOT"] ?? defaultRoot
        let vg = value(after: "--voicegroup") ?? env["VG_LABEL"] ?? "voicegroup229"
        let iterationsStr = value(after: "--iterations") ?? env["VG_ITERATIONS"]
        let iterations = Int(iterationsStr ?? "50") ?? 50

        return Config(rootDir: root, voicegroup: vg, iterations: iterations)
    }

    private struct Config {
        let rootDir: String
        let voicegroup: String
        let iterations: Int
    }
}


