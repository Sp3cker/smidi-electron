import type ConfigRepository from "../repos/Config/ConfigRepository";
class Config {
  constructor(private readonly configRepository: ConfigRepository) {
    const config = this.configRepository.getConfig();
    if (!config) {
      this.configRepository.writeConfig(["expansionDirectory", ""]);
    }
  }

  getConfig() {
    return this.configRepository.getConfig();
  }
  writeConfig(config: [string, string]) {
    this.configRepository.writeConfig(config);
  }
}

export default Config;
