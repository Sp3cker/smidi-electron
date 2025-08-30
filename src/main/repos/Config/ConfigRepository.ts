import type { Database } from "better-sqlite3";

interface ConfigRow {
  id: number;
  key: string;
  value: string;
}

class ConfigRepository {
  constructor(private readonly db: Database) {}

  getConfig(): ConfigRow[] {
    const config = this.db.prepare("SELECT * FROM config").all() as ConfigRow[];
    return config;
  }

  getConfigByKey(key: string): ConfigRow | undefined {
    const config = this.db
      .prepare("SELECT * FROM config WHERE key = ?")
      .get(key) as ConfigRow | undefined;
    return config;
  }

  updateExpansionDir(value: string): void {
    this.db
      .prepare("UPDATE config SET value = ? WHERE key = 'expansionDir'")
      .run(value);
  }

  writeConfig(config: [string, string]): void {
    this.db
      .prepare("INSERT INTO config (key, value) VALUES (?, ?)")
      .run(config);
  }
}

export default ConfigRepository;
