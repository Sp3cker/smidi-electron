import Foundation

public func preloadDirectoryFileNames(atPath directoryURL: URL) throws -> [String:
  URL]
{
  let fileManager = FileManager.default


  // Enumerate directory contents
  let urls = try fileManager.contentsOfDirectory(
    at: directoryURL,
    includingPropertiesForKeys: [.isRegularFileKey, .nameKey],
    options: [.skipsHiddenFiles]
  )

  // Create dictionary of file names to URLs and prefetch metadata
  var fileMap: [String: URL] = [:]
  for url in urls {
    let resourceValues = try url.resourceValues(forKeys: [
      .isRegularFileKey, .nameKey,
    ])
    if resourceValues.isRegularFile ?? false, let fileName = resourceValues.name
    {
      fileMap[fileName] = url
      // Access metadata to encourage OS caching
      _ = try url.resourceValues(forKeys: [.fileSizeKey])
    }
  }

  return fileMap
}
