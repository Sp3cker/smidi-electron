import type { Database } from "better-sqlite3";

class ConfigRepository {
  constructor(private readonly db: Database) {}

  getConfig() {
    const config = this.db.prepare("SELECT * FROM config").get();
    return config;
  }
  writeConfig(config: [string, string]) {
    this.db
      .prepare("INSERT INTO config (key, value) VALUES (?, ?)")
      .run(config);
  }
}

export default ConfigRepository;
