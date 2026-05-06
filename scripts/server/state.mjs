import fsSync from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const isValidCharacterId = (value) =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(value);

export const createStateStore = ({ rootDir }) => {
  const stateDbDir = path.join(rootDir, "data");
  const stateDbPath = path.join(stateDbDir, "state.db");

  fsSync.mkdirSync(stateDbDir, { recursive: true });

  const db = new Database(stateDbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS character_state (
      character_id TEXT PRIMARY KEY,
      state_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
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

  const stmts = {
    getCharacterState: db.prepare(
      "SELECT state_json FROM character_state WHERE character_id = ?",
    ),
    upsertCharacterState: db.prepare(`
      INSERT INTO character_state (character_id, state_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(character_id) DO UPDATE SET
        state_json = excluded.state_json,
        updated_at = excluded.updated_at
    `),
    insertMoodboardSnapshot: db.prepare(`
      INSERT INTO moodboard_snapshots
        (character_id, label, moodboard_json, item_count, created_at)
      VALUES (?, ?, ?, ?, ?)
    `),
    listMoodboardSnapshots: db.prepare(`
      SELECT id, label, item_count, created_at
      FROM moodboard_snapshots
      WHERE character_id = ?
      ORDER BY created_at DESC
    `),
    getMoodboardSnapshot: db.prepare(`
      SELECT id, label, moodboard_json, item_count, created_at
      FROM moodboard_snapshots
      WHERE character_id = ? AND id = ?
    `),
    deleteMoodboardSnapshot: db.prepare(
      "DELETE FROM moodboard_snapshots WHERE character_id = ? AND id = ?",
    ),
  };

  return { db, stmts };
};

export const registerStateRoutes = (app, { stmts }) => {
  app.get("/api/state/:characterId", (request, response, next) => {
    try {
      const characterId = request.params.characterId;

      if (!isValidCharacterId(characterId)) {
        response.status(400).json({ message: "Invalid character id." });
        return;
      }

      const row = stmts.getCharacterState.get(characterId);

      if (!row) {
        response.status(404).json({ message: "No state for this character." });
        return;
      }

      response.json(JSON.parse(row.state_json));
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/state/:characterId", (request, response, next) => {
    try {
      const characterId = request.params.characterId;

      if (!isValidCharacterId(characterId)) {
        response.status(400).json({ message: "Invalid character id." });
        return;
      }

      if (
        !request.body ||
        typeof request.body !== "object" ||
        Array.isArray(request.body)
      ) {
        response.status(400).json({ message: "Body must be a JSON object." });
        return;
      }

      stmts.upsertCharacterState.run(
        characterId,
        JSON.stringify(request.body),
        Date.now(),
      );

      response.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/state/:characterId", (request, response, next) => {
    try {
      const characterId = request.params.characterId;

      if (!isValidCharacterId(characterId)) {
        response.status(400).json({ message: "Invalid character id." });
        return;
      }

      if (
        !request.body ||
        typeof request.body !== "object" ||
        Array.isArray(request.body)
      ) {
        response.status(400).json({ message: "Body must be a JSON object." });
        return;
      }

      const existingRow = stmts.getCharacterState.get(characterId);
      const existingState = existingRow ? JSON.parse(existingRow.state_json) : {};
      const mergedState = { ...existingState, ...request.body };

      stmts.upsertCharacterState.run(
        characterId,
        JSON.stringify(mergedState),
        Date.now(),
      );

      response.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });
};

export const registerMoodboardSnapshotRoutes = (app, { stmts }) => {
  app.post(
    "/api/state/:characterId/moodboard/snapshots",
    (request, response, next) => {
      try {
        const characterId = request.params.characterId;

        if (!isValidCharacterId(characterId)) {
          response.status(400).json({ message: "Invalid character id." });
          return;
        }

        const row = stmts.getCharacterState.get(characterId);

        if (!row) {
          response
            .status(404)
            .json({ message: "No saved state for this character." });
          return;
        }

        const state = JSON.parse(row.state_json);
        const moodboard = state?.moodboard;

        if (!moodboard || typeof moodboard !== "object") {
          response
            .status(404)
            .json({ message: "No moodboard found in saved state." });
          return;
        }

        const items = Array.isArray(moodboard.items) ? moodboard.items : [];
        const rawLabel =
          typeof request.body?.label === "string" ? request.body.label.trim() : "";
        const label = rawLabel.slice(0, 120) || null;
        const createdAt = Date.now();

        const result = stmts.insertMoodboardSnapshot.run(
          characterId,
          label,
          JSON.stringify(moodboard),
          items.length,
          createdAt,
        );

        response.status(201).json({
          id: Number(result.lastInsertRowid),
          label,
          itemCount: items.length,
          createdAt,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  app.get(
    "/api/state/:characterId/moodboard/snapshots",
    (request, response, next) => {
      try {
        const characterId = request.params.characterId;

        if (!isValidCharacterId(characterId)) {
          response.status(400).json({ message: "Invalid character id." });
          return;
        }

        const rows = stmts.listMoodboardSnapshots.all(characterId);
        response.json({
          snapshots: rows.map((row) => ({
            id: row.id,
            label: row.label,
            itemCount: row.item_count,
            createdAt: row.created_at,
          })),
        });
      } catch (error) {
        next(error);
      }
    },
  );

  app.get(
    "/api/state/:characterId/moodboard/snapshots/:snapshotId",
    (request, response, next) => {
      try {
        const characterId = request.params.characterId;
        const snapshotId = Number(request.params.snapshotId);

        if (!isValidCharacterId(characterId)) {
          response.status(400).json({ message: "Invalid character id." });
          return;
        }

        if (!Number.isInteger(snapshotId) || snapshotId <= 0) {
          response.status(400).json({ message: "Invalid snapshot id." });
          return;
        }

        const row = stmts.getMoodboardSnapshot.get(characterId, snapshotId);

        if (!row) {
          response.status(404).json({ message: "Snapshot not found." });
          return;
        }

        response.json({
          id: row.id,
          label: row.label,
          itemCount: row.item_count,
          createdAt: row.created_at,
          moodboard: JSON.parse(row.moodboard_json),
        });
      } catch (error) {
        next(error);
      }
    },
  );

  app.delete(
    "/api/state/:characterId/moodboard/snapshots/:snapshotId",
    (request, response, next) => {
      try {
        const characterId = request.params.characterId;
        const snapshotId = Number(request.params.snapshotId);

        if (!isValidCharacterId(characterId)) {
          response.status(400).json({ message: "Invalid character id." });
          return;
        }

        if (!Number.isInteger(snapshotId) || snapshotId <= 0) {
          response.status(400).json({ message: "Invalid snapshot id." });
          return;
        }

        const result = stmts.deleteMoodboardSnapshot.run(
          characterId,
          snapshotId,
        );

        if (result.changes === 0) {
          response.status(404).json({ message: "Snapshot not found." });
          return;
        }

        response.json({ ok: true });
      } catch (error) {
        next(error);
      }
    },
  );
};
