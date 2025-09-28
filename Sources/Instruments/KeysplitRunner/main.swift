import Config
import Dispatch
import Foundation
import Keysplits

try await KeysplitRunner.main()
struct KeysplitRunner {

    static func main() async throws {
        fputs("ksparse starting...\n", stderr)

        // Optional: allow giving Instruments / debugger time to attach.

        var timesMs: [Double] = []
        var results: [String] = []
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

            print("📊 Execution Time Stats:")
            print("  Runs: \(timesMs.count)")
            print("  2nd run: \(timesMs[2])")
            print("  Mean: \(String(format: "%.1f", mean))ms")
            print("  Mode: \(String(format: "%.1f", mode))ms")
            print("  Min: \(String(format: "%.1f", minVal))ms")
            print("  Max: \(String(format: "%.1f", maxVal))ms")

            if let first = results.first {
                do {
                    let out = homeDir.appending(path: "dev").appending(
                        path: "reactProjects"
                    ).appending(
                        path: "smidi-electron"
                    )
                    let outURL =
                        out
                        .appendingPathComponent("keysplit-results.json")
                    try first.write(to: outURL, atomically: true, encoding: .utf8)
                    print("Wrote example result to (\(outURL)) (\(first.count) bytes)")
                } catch {
                    fputs("Error writing keysplit-results.json: \(error)\n", stderr)
                }
            }
        }

        let defaultKeysplitPath = parseKeysplitPath()

        do {
            for _ in 0..<50 {
                let start = DispatchTime.now()
                let _ = try KeysplitParser.parseFile(defaultKeysplitPath)
                let end = DispatchTime.now()
                let nanos = end.uptimeNanoseconds - start.uptimeNanoseconds
                timesMs.append(Double(nanos) / 1_000_000)

            }
        } catch {
            print(error)
            throw error
        }
    }

    private static func parseKeysplitPath() -> String {
        let args = CommandLine.arguments

        func value(after flag: String) -> String? {
            guard let idx = args.firstIndex(of: flag), idx + 1 < args.count else {
                return nil
            }
            return args[idx + 1]
        }

        let env = ProcessInfo.processInfo.environment
        let homeDir = FileManager.default.homeDirectoryForCurrentUser
            .standardizedFileURL

        // Default keysplit path
        let defaultKeysplitPath =
            homeDir
            .appendingPathComponent("dev")
            // .appendingPathComponent("nodeProjects")
            .appendingPathComponent("pokeemerald-expansion")
            .appendingPathComponent("sound")
            .appendingPathComponent("keysplit_tables.inc")
            .path

        return value(after: "--keysplit") ?? env["KS_PATH"] ?? defaultKeysplitPath
    }
}
