import FileWatcher from "../lib/FileWatcher";
import type fs from "fs";

class MidiMan {
  fileWatcher: FileWatcher | null = null;
  watchDirectory: string | null = null;

  constructor() {
    return;
  }
  setWatcher(
    directory: string,
    onFileListReady: (fileNames: string[]) => void
  ) {
    this.watchDirectory = directory;
    if (this.fileWatcher) {
      this.fileWatcher.stop();
    }
    this.fileWatcher = new FileWatcher(directory);
    this.fileWatcher.emitter.on("add", (obj: { path: string }) => {
      console.log("add", obj.path);
    });
    this.fileWatcher.emitter.on(
      "change",
      (obj: { path: string; stat: fs.Stats }) => {
        console.log("change", obj.path);
      }
    );
    this.fileWatcher.emitter.on("unlink", (obj: { path: string }) => {
      console.log("unlink", obj.path);
    });
    // When the file watcher is ready, set the files we're watching
    // And emit them for the frontend
    this.fileWatcher.emitter.on("ready", (fileNames: string[]) => {
      if (fileNames.length > 0) {
        onFileListReady(fileNames);
      }
    });
    return true;
  }
  endWatch() {
    this.fileWatcher?.emitter.removeAllListeners();
  }
}

export default MidiMan;
