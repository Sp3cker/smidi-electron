//
//  main.swift
//  VoicegroupParser
//
//  Created by Spencer on 10/7/25.
//

import Foundation
import BinaryParsing

let myurls = try FileManager.default.contentsOfDirectory(
  at: URL(fileURLWithPath: "/Users/spencer/Documents/midiexport"), includingPropertiesForKeys: nil,
  options: .skipsHiddenFiles)
guard myurls.isEmpty == false else { fatalError() }
