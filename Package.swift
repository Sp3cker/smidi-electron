// swift-tools-version: 6.1
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
  name: "VoicegroupParser",
  platforms: [.macOS(.v15)],
  products: [
    .library(name: "Module", type: .dynamic, targets: ["module"]),
    //        .library(name: "Keysplits", targets: ["Keysplits"]),
    .library(name: "Instruments", targets: ["Instruments"]),
    .library(name: "Voicegroups", targets: ["Voicegroups"]),
    .executable(name: "vgparse", targets: ["VoicegroupRunner"]),
    .executable(name: "ksparse", targets: ["KeysplitRunner"]),
  ],
  dependencies: [
    .package(
      url: "https://github.com/kabiroberai/node-swift",
      branch: "main"
    )
  ],
  // TARGET NAMES (not "name", but target: thisString) ARE FOLDER NAMES
  targets: [
    //    .testTarget(
    //      name: "VoicegroupParserTests",
    //      dependencies: ["Keysplits", "Voicegroups"],
    //      swiftSettings: [.enableUpcomingFeature("StrictConcurrency")]
    //    ),
    .target(name: "Filesystem", path: "Sources/Core/Filesystem"),
    .target(
      name: "module",
      dependencies: [
        .product(name: "NodeAPI", package: "node-swift"),
        .product(name: "NodeModuleSupport", package: "node-swift"),
        "Instruments",
        "Config",

      ]
    ),
    //    .target(name: "Keysplits", path: "Sources/Core/Keysplits"),
    .target(
      name: "Instruments",
      dependencies: ["Voicegroups", "Config", "Keysplits"],
      path: "Sources/Core/Instruments",

    ),
    .target(name: "Config", path: "Sources/Core/Config"),
    .target(
      name: "Voicegroups",
      dependencies: ["Config", "Filesystem"],
      path: "Sources/Core/Voicegroups"
    ),
    .target(name: "Keysplits", dependencies: ["Sweep"], path: "Sources/Core/Keysplits"),
    .target(name: "Sweep", path: "Sources/Core/Sweep"),
    .executableTarget(
      name: "VoicegroupRunner",
      dependencies: ["Voicegroups", "Config"],
      path: "Sources/Core/VoicegroupRunner",
      swiftSettings: [.enableUpcomingFeature("StrictConcurrency")],
    ),
    .executableTarget(
      name: "KeysplitRunner",
      dependencies: ["Keysplits"],
      path: "Sources/Core/KeysplitRunner",
      swiftSettings: [.enableUpcomingFeature("StrictConcurrency")],
    ),
  ]
)
