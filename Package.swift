// swift-tools-version: 6.1
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
  name: "VoicegroupParser",
  platforms: [.macOS(.v15)],
  products: [
    //  .executable(name: "VoicegroupParserTests", targets: ["VoicegroupParserTests"]),
    // .library(name: "Module", type: .dynamic, targets: ["module"]),
    .library(name: "Keysplits", targets: ["Keysplits"]),
    .library(name: "Voicegroups", targets: ["Voicegroups"]),
  ],
  dependencies: [
    .package(url: "https://github.com/kabiroberai/node-swift", branch: "main")
  ],
  // TARGET NAMES (not "name", but target: thisString) ARE FOLDER NAMES
  targets: [
    .testTarget(
      name: "VoicegroupParserTests",
      dependencies: ["Keysplits", "Voicegroups"]
    ),
    .target(name: "Common", path: "Sources/Common"),
    // .target(
    //   name: "module",
    //   dependencies: [
    //     .product(name: "NodeAPI", package: "node-swift"),
    //     .product(name: "NodeModuleSupport", package: "node-swift"),
    //     "Common",
    //     "Keysplits",
    //     "Voicegroups",
    //   ]),
    .target(name: "Keysplits", dependencies: ["Common"], path: "Sources/Keysplits"),
    .target(name: "Voicegroups", dependencies: ["Common"], path: "Sources/Voicegroups"),
  ]
)
