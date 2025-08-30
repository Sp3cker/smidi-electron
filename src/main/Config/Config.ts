import type ConfigRepository from "../repos/Config/ConfigRepository";
class Config {
  constructor(private readonly configRepository: ConfigRepository) {
    const config = this.configRepository.getConfig();
    if (!config) {
      this.configRepository.writeConfig(["expansionDirectory", ""]);
    }
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
}

export default Config;
