import Foundation
import RegexBuilder

struct LineRegex {

    nonisolated(unsafe)  // <---
        static let rx = Regex {
            ZeroOrMore(.anyOf(" \t"))
            "voice_keysplit"
            OneOrMore(.whitespace)
            Capture { OneOrMore(.word) }  // group
            ZeroOrMore(.whitespace)
            ","
            ZeroOrMore(.whitespace)
            Capture { OneOrMore(.word) }  // table
            Optionally {
                ZeroOrMore(.whitespace)
                "@"
                ZeroOrMore(.whitespace)
                Capture { ZeroOrMore(.any) }  // comment
            }
        }
}
