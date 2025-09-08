@preconcurrency import Parsing

let KeysplitParser = Parse(input: Substring.self) {
    Prefix {$0 == "."}
}
