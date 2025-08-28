import { watch } from "chokidar";
import { EventEmitter } from "events";
class FileWatcher {
  private readonly watcher: ReturnType<typeof watch>;
  public emitter: EventEmitter;
  // Flipped on chokidar.ready
  isReady: boolean = false;
  constructor(directory: string) {
    // Emitter emits when Chokidar detects a change in the directory
    this.emitter = new EventEmitter();
    this.watcher = watch(directory, {
      ignored: /(^|\/)\../,
      persistent: true,
    });

    this.watcher.on("add", (path) => {
      this.emitter.emit("add", { path });
    });

    this.watcher.on("change", (path, stats) => {
      this.emitter.emit("change", { path, stats: stats?.mtime });
    });

    this.watcher.on("unlink", (path) => {
      this.emitter.emit("unlink", { path });
    });
    this.watcher.on("ready", () => {
      this.isReady = true;
      this.emitter.emit("ready", this.getAllWatchedFiles());
    });
  }
  getFileNames() {
    return this.watcher.getWatched();
  }

  getAllWatchedFiles(): string[] {
    // chokidar.getWatched() returns an object where:
    // - Keys are directory paths (strings)
    // - Values are arrays of file names within those directories
    // We need to iterate over this structure to combine directory + filename into full paths
    return Object.entries(this.watcher.getWatched()).flatMap(
      ([dirPath, fileNames]) =>
        fileNames.map((fileName) => `${dirPath}/${fileName}`)
    );
  }
  stop() {
    this.watcher.close();
    this.emitter.removeAllListeners();
  }
}

export default FileWatcher;
