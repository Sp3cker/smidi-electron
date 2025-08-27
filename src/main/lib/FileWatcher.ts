import { watch } from "chokidar";
import { EventEmitter } from "events";
class FileWatcher {
  private readonly watcher: ReturnType<typeof watch>;
  public emitter: EventEmitter;
  constructor(directory: string) {
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
  }
}

export default FileWatcher;
