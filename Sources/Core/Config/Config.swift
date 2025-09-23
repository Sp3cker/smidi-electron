//
//  Config.swift
//  VoicegroupParser
//
//  Created by Spencer on 9/21/25.
//

import Foundation
struct ConfigError: LocalizedError {
  let description: String
  init(_ description: String) {
    self.description = description
  }
  var errorDescription: String {
    return self.description
  }

}
public actor Config {
  public init() {}
  private var _rootDir: String? = nil
  public var rootDir: String {
    get throws {
      if self._rootDir == nil {
        throw ConfigError("No rootdir set")
      }
      return self._rootDir!
    }
  }
  public func setRootDir(root: String) async {
    self._rootDir = root
  }
}
