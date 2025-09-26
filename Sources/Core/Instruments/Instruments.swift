import Config
import Console
import Foundation
import Keysplits
import Voicegroups

protocol InstrumentsService {
  func configure(rootDir: String) async
  func start() async throws
  func parseVoicegroupFile(label: String)
}
public actor Instruments {
  let config = Config()
  var voicegroups: Voicegroup? = nil
  public nonisolated(unsafe) var  errorHandler: (@Sendable (any ConsoleProtocol) -> Void)? = nil
  // var keysplits: Keysplit? = nil
  public init() {
    print("Instruments initialized")
  }

  public func configure(rootDir: String) async {
    await self.config.setRootDir(root: rootDir)
  }
  // When called by a callee such as parseVoiceGroup,
  // will call whatever gets set as `errorHandler`
  // with params from callee
  public nonisolated func onError(_ handler: @escaping @Sendable (any ConsoleProtocol) -> Void) {
    self.errorHandler = handler
  }

  private nonisolated func forwardError(_ console: any ConsoleProtocol) {
    let consoleMessage = ConsoleErrorMessage(message: console.message, level: , message: String?, context: [String : String]?)
    Task { await self.invokeErrorHandler(console) }
  }

  private func invokeErrorHandler(_ console: any ConsoleProtocol) {
    if let handler = self.errorHandler {
      handler(console)
    } else {
      print("NO error handler set")
    }
  }

  public func parseVoicegroupFile(label: String) async throws -> Data {
    print("Parsing voicegroup file for \(label)")

    let root = try await self.config.rootDir
    if self.voicegroups == nil {
      self.voicegroups = Voicegroup(rootDir: root, onError: self.forwardError)
    }
    do {
      return try await self.voicegroups!.parseVoicegroupFile(voicegroup: label)
    } catch {
      // Forward to registered error handler and rethrow
      self.forwardError(ConsoleErrorMessage(error: error))
      throw error
    }
  }

}
