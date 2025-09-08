import type { Database } from "better-sqlite3";
import { access, accessSync, constants } from "fs";

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
  rootPathExists(path: string) {
    return accessSync(path, constants.F_OK);
  }
  updateExpansionDir(value: string): void {
    this.db
      .prepare(
        `
        INSERT INTO config (key, value) VALUES ('expansionDir', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `
      )
      .run(value);
  }

  resetConfig(): void {
    this.db.prepare("UPDATE config SET value = ''").run();
  }

  writeConfig(config: [string, string]): void {
    this.db
      .prepare("INSERT INTO config (key, value) VALUES (?, ?)")
      .run(config);
  }
}

export default ConfigRepository;
