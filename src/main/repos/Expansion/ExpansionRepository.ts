import path from "path";


class ExpansionRepository {
  private repoRoot: string = "";

  constructor() {
    // Remove circular reference - this class doesn't need to instantiate itself
  }
  public setRepoRoot(repoRoot: string) {
    this.repoRoot = repoRoot;
  }
}

export default ExpansionRepository;
