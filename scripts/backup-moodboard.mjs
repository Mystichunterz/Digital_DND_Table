import Database from "better-sqlite3";
import path from "node:path";
import fsSync from "node:fs";

const ROOT_DIR = process.cwd();
const STATE_DB_DIR = path.join(ROOT_DIR, "data");
const STATE_DB_PATH = path.join(STATE_DB_DIR, "state.db");

if (!fsSync.existsSync(STATE_DB_PATH)) {
  console.error(`No database at ${STATE_DB_PATH} — nothing to back up.`);
  process.exit(1);
}

const characterId = process.argv[2] ?? "default";
const label = process.argv[3] ?? `Manual backup ${new Date().toISOString()}`;

const db = new Database(STATE_DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS moodboard_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id TEXT NOT NULL,
    label TEXT,
    moodboard_json TEXT NOT NULL,
    item_count INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_moodboard_snapshots_character_created
    ON moodboard_snapshots(character_id, created_at DESC);
`);

const row = db
  .prepare("SELECT state_json FROM character_state WHERE character_id = ?")
  .get(characterId);

if (!row) {
  console.error(`No saved state found for character "${characterId}".`);
  process.exit(1);
}

const state = JSON.parse(row.state_json);
const moodboard = state?.moodboard;

if (!moodboard || typeof moodboard !== "object") {
  console.error(`Character "${characterId}" has no moodboard to back up.`);
  process.exit(1);
}

const items = Array.isArray(moodboard.items) ? moodboard.items : [];
const moodboardJson = JSON.stringify(moodboard);
const sizeMb = (moodboardJson.length / (1024 * 1024)).toFixed(2);

const result = db
  .prepare(
    `INSERT INTO moodboard_snapshots
       (character_id, label, moodboard_json, item_count, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
  .run(characterId, label, moodboardJson, items.length, Date.now());

console.log(
  `Backup created: id=${result.lastInsertRowid}, character="${characterId}", items=${items.length}, size=${sizeMb} MB, label="${label}"`,
);

db.close();
