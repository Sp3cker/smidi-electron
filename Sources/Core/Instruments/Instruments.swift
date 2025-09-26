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
  public var errorhandler: ((any ConsoleProtocol) -> Void)? = nil
  // var keysplits: Keysplit? = nil
  public init() {
    print("Instruments initialized")
  }

  public func configure(rootDir: String) async {
    await self.config.setRootDir(root: rootDir)
  }
  // When called by a callee such as parseVoiceGroup,
  // will call whatever gets set as `errorhandler`
  // with params from callee
  public func onError(action: ConsoleProtocol) {
    guard self.errorhandler != nil else {
      print("NO error handler set")
      return
    }
    self.errorhandler!(action)
  }
  public func parseVoicegroupFile(label: String) async throws -> Data {
    print("Parsing voicegroup file for \(label)")

    let root = try await self.config.rootDir
    if self.voicegroups == nil {
      self.voicegroups = Voicegroup(rootDir: root, onError: self.onError)
    }
    do {
      return try await self.voicegroups!.parseVoicegroupFile(voicegroup: label)
    } catch {
      throw error
    }
  }

}
