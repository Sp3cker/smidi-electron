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
  targets: [

    .target(
      name: "module",
      dependencies: [
        .product(name: "NodeAPI", package: "node-swift"),
        .product(name: "NodeModuleSupport", package: "node-swift"),
        "Instruments",
        "Config",
        "Console",
      ],
      path: "Sources/module"
    ),
    .target(
      name: "Instruments",
      dependencies: ["Voicegroups", "Config", "Keysplits", "Console"],
      path: "Sources/Instruments",
      sources: ["Instruments.swift"]
    ),
    .target(
      name: "Config",
      path: "Sources/Core",
      sources: ["Config.swift"]
    ),
    .target(
      name: "Console",
      path: "Sources/Core",
      sources: ["Console.swift", "ConsoleProtocol.swift"]
    ),
    .target(
      name: "Voicegroups",
      dependencies: ["Config", "Console"],
      path: "Sources/Instruments/Voicegroups"
    ),
    .target(
      name: "Keysplits",
      dependencies: ["Sweep"],
      path: "Sources/Instruments/Keysplits"
    ),
    .target(
      name: "Sweep",
      path: "Sources/Core/Sweep"
    ),

    .executableTarget(
      name: "VoicegroupRunner",
      dependencies: ["Voicegroups", "Config", "Console"],
      path: "Sources/Instruments/VoicegroupRunner",
      swiftSettings: [.enableUpcomingFeature("StrictConcurrency")],
    ),
    .executableTarget(
      name: "KeysplitRunner",
      dependencies: ["Keysplits", "Config"],
      path: "Sources/Instruments/KeysplitRunner",
      swiftSettings: [.enableUpcomingFeature("StrictConcurrency")],
    ),
  ]
)
