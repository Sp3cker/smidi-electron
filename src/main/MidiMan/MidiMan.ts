import FileWatcher from "../lib/FileWatcher";
import type fs from "fs";

class MidiMan {
  fileWatcher: FileWatcher | null = null;
  constructor() {
    return;
  }
  setWatcher(directory: string) {
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
  }
  endWatch() {
    this.fileWatcher?.emitter.removeAllListeners();
  }
}

export default MidiMan;
