// Snapshot a character's current moodboard into the SQLite store, the same
// way the "Save snapshot" button does.
// usage: npm run backup:moodboard -- [characterId] [label]
import path from "node:path";
import fsSync from "node:fs";
import { createStateStore } from "../server/state.mjs";

const ROOT_DIR = process.cwd();
const STATE_DB_PATH = path.join(ROOT_DIR, "data", "state.db");

if (!fsSync.existsSync(STATE_DB_PATH)) {
  console.error(`No database at ${STATE_DB_PATH} — nothing to back up.`);
  process.exit(1);
}

const characterId = process.argv[2] ?? "default";
const label = process.argv[3] ?? `Manual backup ${new Date().toISOString()}`;

const { db, stmts } = createStateStore({ rootDir: ROOT_DIR });

const row = stmts.getCharacterState.get(characterId);

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

const result = stmts.insertMoodboardSnapshot.run(
  characterId,
  label,
  moodboardJson,
  items.length,
  Date.now(),
);

console.log(
  `Backup created: id=${result.lastInsertRowid}, character="${characterId}", items=${items.length}, size=${sizeMb} MB, label="${label}"`,
);

db.close();
