public enum ParseError: Error {
  case io(file: String, underlying: Error?)
  case malformedLine(line: Int, reason: String)
  case noTables
  case validation(String)
}