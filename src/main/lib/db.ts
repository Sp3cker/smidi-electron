import sqlite from "better-sqlite3";
export type SqliteDb = InstanceType<typeof import("better-sqlite3")>;

const db: SqliteDb = new sqlite("smidi-electron.db");
db.pragma("journal_mode = MEMORY");

db.exec(`CREATE TABLE if not EXISTS projects (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL UNIQUE,  -- User-defined project name (e.g., 'MyMidiProject')
directoryPath TEXT NOT NULL,  -- Full path to the watched MIDI directory (e.g., '/Users/me/midis/')
createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
voicegroup TEXT NOT NULL DEFAULT 'voicegroup191.inc'
);
CREATE TABLE if not EXISTS config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL
);
`);

export { db };
