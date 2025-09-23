import Config
import Foundation
import Voicegroups
import Keysplits

protocol InstrumentsService {
  func configure(rootDir: String) async
  func start() async throws
  func parseVoicegroupFile(label: String)
}
public actor Instruments {
  let config = Config()
  var voicegroups: Voicegroup? = nil
  var keysplits: Keysplit? = nil
  public init() {
    print("Instruments initialized")
  }

  public func configure(rootDir: String) async {
    await self.config.setRootDir(root: rootDir)
  }

  public func parseVoicegroupFile(label: String) async throws -> Data {
    print("Parsing voicegroup file for \(label)")

    let root = try await self.config.rootDir
    if self.voicegroups == nil {
      self.voicegroups = Voicegroup(rootDir: root)
    }

    return try await self.voicegroups!.parseVoicegroupFile(voicegroup: label)
  }

}
