import PackagePlugin
import Foundation

@main
struct CopySQLiteDLLPlugin: BuildToolPlugin {
    func createBuildCommands(context: PluginContext, target: Target) async throws -> [Command] {
        // Check if the build is targeting Windows
        let isWindows = context.package.platforms.contains { $0.platformName.contains("windows") }
        
        // Only generate the copy command if building for Windows
        if isWindows {
            let sourcePath = context.package.directory.appending("Resources/sqlite3.dll")
            let outputPath = context.pluginWorkDirectory.appending("sqlite3.dll")
            
            // Use 'copy' command for Windows compatibility
            return [
                .prebuildCommand(
                    displayName: "Copy SQLite DLL for Windows",
                    executable: .init("cmd.exe"),
                    arguments: ["/C", "copy", sourcePath.string, outputPath.string],
                    outputFilesDirectory: context.pluginWorkDirectory
                )
            ]
        }
        
        // Return empty array for non-Windows platforms
        return []
    }
}