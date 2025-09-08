import { accessSync } from "fs";
import path from "path";

class ExpansionRepository {
  private repoRoot: string = "";

  constructor() {
    // Remove circular reference - this class doesn't need to instantiate itself
  }
  public setRepoRoot(repoRoot: string) {
    // try {
    //   accessSync(path.resolve(repoRoot));
    // } catch (error) {
    //   throw new Error("ExpansionRepository: Invalid repository root path");
    // }
    this.repoRoot = repoRoot;
  }
  isValidRoot(repoRoot: string) {
    try {
      accessSync(path.resolve(repoRoot));
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default ExpansionRepository;
