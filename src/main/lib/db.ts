import sqlite from "better-sqlite3";
export type SqliteDb = InstanceType<typeof import("better-sqlite3")>;

const db = new sqlite("smidi-electron.db", { verbose: console.log });

db.exec(`CREATE TABLE if not EXISTS projects (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL UNIQUE,  -- User-defined project name (e.g., 'MyMidiProject')
directory_path TEXT NOT NULL,  -- Full path to the watched MIDI directory (e.g., '/Users/me/midis/')
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
export_order JSON,  -- JSON array of file names in merge order (e.g., ['file1.mid', 'file2.mid']) for single-file export
cc_edits JSON  -- JSON object mapping file names to arrays of CC edits (e.g., {'file1.mid': [{'timestamp': 100, 'channel': 1, 'controller': 7, 'value': 64, 'action': 'update'}, ...]})
);`);

const wrapper: { db: SqliteDb } = { db };
export { wrapper };
