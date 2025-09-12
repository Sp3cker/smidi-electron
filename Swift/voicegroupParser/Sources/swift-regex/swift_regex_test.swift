import Foundation

@main
struct SwiftRegexTest {
  static func main() {
    do {
      let start = Date()
      defer {
        let elapsed = Date().timeIntervalSince(start) * 1000
        fputs(String(format: "SwiftRegex Elapsed: %.1fms\n", elapsed), stderr)
      }

      let text = try String(
        contentsOf: URL(
          fileURLWithPath: "/Users/spencer/dev/swiftProjects/voicegroupParser/keysplit_tables.inc"),
        encoding: .utf8)

      // Test the RegexBuilder implementation
      let parsed = SwiftRegexParsers.parseFile(text)
      // print("RegexBuilder result:")
      // print(parsed)

      // print("\nTotal tables found: \(parsed.count)")

      // Test parsing a specific table
      if let firstTable = parsed.tables.randomElement() {
        // print("\nTesting table parsing for: \(firstTable)")

        print("Successfully parsed table: \(firstTable.name) \(firstTable.byteLines)")
        // print("Offset: \(table.definition.offset)")

      } else {
        print("Failed to parse table")
      }

    } catch {
      fputs("error: \(error)\n", stderr)
      exit(1)
    }
  }
}
