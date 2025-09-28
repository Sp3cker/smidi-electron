import Foundation

struct ConsoleMessage {
  var severity: ConsoleMessageSeverity
  var message: String
  public init(severity: ConsoleMessageSeverity, message: String) {
    self.severity = severity
    self.message = message
  }
}

enum ConsoleMessageSeverity {
  case fixable, badError
}

// extension ConsoleMessageSeverity {

@MainActor
public final class Console {
  public init() {
    
  }
}
