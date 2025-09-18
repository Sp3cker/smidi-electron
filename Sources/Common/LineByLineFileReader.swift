import Foundation

#if os(macOS)
    import Darwin
#else
    import Glibc
#endif

public class LineByLineFileReader {
    private let fp: UnsafeMutablePointer<FILE>!
    private var buffer: UnsafeMutablePointer<Int8>?
    private var bufferSize: Int

    public init?(filePath: String) {
        let fileManager = FileManager.default
        if !fileManager.fileExists(atPath: filePath) { return nil }
        self.fp = fopen(filePath, "r")
        if fp == nil {

            return nil
        }

        // getline function will set these as required
        self.buffer = nil
        self.bufferSize = 0

    }

    deinit {
        fclose(fp)
        if buffer != nil {
            free(buffer)
            buffer = nil
        }
    }
}

// ---------------------------------------------------
//
extension LineByLineFileReader {
    public func getNextLine() -> String? {
        let r = getline(&buffer, &bufferSize, fp)

        print(r)
        if r == -1 {
            return nil
        }

        guard let buffer = buffer, r > 0 else {
            return nil
        }

        // convert the buffer contents to a string
        let line = String(cString: buffer)

        return line
    }
}
