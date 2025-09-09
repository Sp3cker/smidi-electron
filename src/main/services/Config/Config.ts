import type ConfigRepository from "../../repos/Config/ConfigRepository";
// * Plan is for this to be ran before app initialization
// * So we know if the config is valid before we start the app.
class Config {
  configIsValid: boolean = false;
  public rootDir: string = "";
  constructor(private readonly configRepository: ConfigRepository) {
    this.validateConfig();
  }
  isValidExpansionDirectory(path: string): boolean {
    return (
      /^((\/[a-zA-Z0-9-_]+)+|\/)$/.test(path) &&
      this.configRepository.rootPathExists(path)
    );
  }

  validateConfig() {
    const config = this.getConfig();
    if (!config) {
      this.configIsValid = false;
      return;
    }
    if (!config.expansionDir) {
      this.configIsValid = false;
      return;
    }
    if (!this.isValidExpansionDirectory(config.expansionDir)) {
      this.rootDir = "";
      this.configIsValid = false;
      return;
    }
    this.configIsValid = true;
    this.rootDir = config.expansionDir;
  }
  getConfig() {
    const storedConfig = this.configRepository.getConfig();
    //{ id: 2, key: 'expansionDir', value: '/asdf' }
    // { id: 1, key: 'expansionDirectory', value: '' },
    const config = storedConfig.reduce(
      (acc, row) => {
        acc[row.key] = row.value;
        return acc;
      },
      {} as Record<string, string>
    );
    const expansionDirExists = this.isValidExpansionDirectory(
      config.expansionDir
    );
    if (!expansionDirExists) {
      config.expansionDir = "";
      this.rootDir = "";
      this.configIsValid = false;
    } else {
      this.rootDir = config.expansionDir;
      this.configIsValid = true;
    }
    return config;
  }
  writeConfig(config: [string, string]) {
    this.configRepository.writeConfig(config);
  }
  updateExpansionDir(value: string) {
    try {
      this.configRepository.updateExpansionDir(value);
    } catch (error) {
      console.error("Error updating expansion directory", error);
      this.configIsValid = false;
      return;
    }
    this.rootDir = value;
    this.configIsValid = true;
  }
  resetConfig() {
    this.configRepository.resetConfig();
  }
}

export default Config;
