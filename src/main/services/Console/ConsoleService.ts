import { EventEmitter } from "events";
import Module from "../../voicegroupParser/build/release/Module.node";

class ConsoleService {
  module: typeof Module;
  emitter: EventEmitter;
  constructor() {
    this.module = Module;
    this.emitter = new EventEmitter();

    // this.emitter.on("start", () => {
    //   console.log("start event received");
    // });
    // this.emitter.on("sensor1", () => {
    //   console.log("start event received");
    // });
    // this.emitter.on("console:error", (level: string, message: string) => {
    //   console.log(`Console Error [${level}]: ${message}`);
    // });
    Module.bridgeConsole(this.emitter.emit.bind(this.emitter));

    // this.emitter.on("emit", (message) => {
    //   console.log(message);
    // });
  
  }
}

export default ConsoleService;
