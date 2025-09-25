import { EventEmitter } from "events";
import Module from "../../voicegroupParser/build/release/Module.node";

class ConsoleService {
  module: typeof Module;
  emitter: EventEmitter;
  constructor() {
    this.module = Module;
    const x = new EventEmitter();

    console.log(Module.bridgeConsole);
    this.emitter = Module.bridgeConsole;
    // this.emitter.on("emit", (message) => {
    //   console.log(message);
    // });
    console.log('typeof emitter:', typeof this.emitter); // should be 'object' (not 'function')
console.log('has on:', typeof this.emitter?.on);     // should be 'function'
console.log('proto:', Object.getPrototypeOf(this.emitter)?.constructor?.name);
  }
}

export default ConsoleService;
