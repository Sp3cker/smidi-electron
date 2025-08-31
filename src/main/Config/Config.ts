import type ConfigRepository from "../repos/Config/ConfigRepository";
class Config {
  constructor(private readonly configRepository: ConfigRepository) {}
  isValidExpansionDirectory(path: string): boolean {
    return /^((\/[a-zA-Z0-9-_]+)+|\/)$/.test(path);
  }

  getConfig() {
    const storedConfig = this.configRepository.getConfig();
    // { id: 1, key: 'expansionDirectory', value: '' },
    //{ id: 2, key: 'expansionDir', value: '/asdf' }
    const config = storedConfig.reduce(
      (acc, row) => {
        acc[row.key] = row.value;
        return acc;
      },
      {} as Record<string, string>
    );
    return config;
  }
  writeConfig(config: [string, string]) {
    this.configRepository.writeConfig(config);
  }
  updateExpansionDir(value: string) {
    this.configRepository.updateExpansionDir(value);
  }
  resetConfig() {
    this.configRepository.resetConfig();
  }
}

export default Config;
