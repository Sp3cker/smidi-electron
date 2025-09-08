// swift-tools-version: 6.1
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(

    name: "zig2",
    platforms: [.macOS(.v15)],

    products: [
        // Products define the executables and libraries a package produces, making them visible to other packages.
        .executable(
            name: "zig2",
            targets: ["zig2"])

    ],
    dependencies: [
        .package(url: "https://github.com/pointfreeco/swift-parsing", from: "0.7.0")
    ],
    targets: [
        // Targets are the basic building blocks of a package, defining a module or a test suite.
        // Targets can depend on other targets in this package and products from dependencies.
        .executableTarget(
            name: "zig2",
            dependencies: [.product(name: "Parsing", package: "swift-parsing")]
        ),
        .testTarget(
            name: "zig2Tests",
            dependencies: ["zig2"]
        ),
    ]
)
