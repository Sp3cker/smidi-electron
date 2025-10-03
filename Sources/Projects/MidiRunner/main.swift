//
//  main.swift
//  VoicegroupParser
//
//  Created by sallegrezza on 10/2/25.
//
import Foundation
import MIDIKitSMF

let wallStart = DispatchTime.now()

let urls = try FileManager.default.contentsOfDirectory(
  at: URL("/Users/sallegrezza/dev/midiexport/")!, includingPropertiesForKeys: nil,
  options: .skipsHiddenFiles)
guard urls.isEmpty == false else { fatalError() }
let results = try await withThrowingTaskGroup(of: MIDIFile.self) { group in
  for path in urls {
    group.addTask {
      return try MIDIFile(rawData: try Data(contentsOf: path))
    }
  }
  var midiFiles: [MIDIFile] = []

  for try await midi in group {
    midiFiles.append(consume midi)
  }

  return midiFiles
}
//print(await results)
let wallEnd = DispatchTime.now()
let elapsedNanos = wallEnd.uptimeNanoseconds - wallStart.uptimeNanoseconds
let elapsedMs = Double(elapsedNanos) / 1_000_000.0
//print(midiFile.tracks[0])  // prints human-readable debug output of the file

print(" \(String(format: "%.3f", elapsedMs)) ms ")
