import express from "express";
import multer from "multer";
import Database from "better-sqlite3";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import {
  registerJournalRoutes,
  ensureNotesDirectoryExists,
} from "./server/journal.mjs";
import { isPathInside } from "./server/utils.mjs";

const PORT = Number(process.env.ASSET_MANAGER_PORT ?? 5180);

const ROOT_DIR = process.cwd();
const ACTIONS_MANIFEST_PATH = path.join(
  ROOT_DIR,
  "src",
  "v2",
  "data",
  "actions-manifest.json",
);
const ACTIONS_ASSET_ROOT = path.join(ROOT_DIR, "src", "assets", "actions");
const STATE_DB_DIR = path.join(ROOT_DIR, "data");
const STATE_DB_PATH = path.join(STATE_DB_DIR, "state.db");

fsSync.mkdirSync(STATE_DB_DIR, { recursive: true });
const stateDb = new Database(STATE_DB_PATH);
stateDb.pragma("journal_mode = WAL");
stateDb.exec(`
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

const getCharacterStateStmt = stateDb.prepare(
  "SELECT state_json FROM character_state WHERE character_id = ?",
);
const upsertCharacterStateStmt = stateDb.prepare(`
  INSERT INTO character_state (character_id, state_json, updated_at)
  VALUES (?, ?, ?)
  ON CONFLICT(character_id) DO UPDATE SET
    state_json = excluded.state_json,
    updated_at = excluded.updated_at
`);
const insertMoodboardSnapshotStmt = stateDb.prepare(`
  INSERT INTO moodboard_snapshots
    (character_id, label, moodboard_json, item_count, created_at)
  VALUES (?, ?, ?, ?, ?)
`);
const listMoodboardSnapshotsStmt = stateDb.prepare(`
  SELECT id, label, item_count, created_at
  FROM moodboard_snapshots
  WHERE character_id = ?
  ORDER BY created_at DESC
`);
const getMoodboardSnapshotStmt = stateDb.prepare(`
  SELECT id, label, moodboard_json, item_count, created_at
  FROM moodboard_snapshots
  WHERE character_id = ? AND id = ?
`);
const deleteMoodboardSnapshotStmt = stateDb.prepare(
  "DELETE FROM moodboard_snapshots WHERE character_id = ? AND id = ?",
);

const isValidCharacterId = (value) =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(value);

const VALID_CATEGORIES = new Set([
  "common",
  "paladin",
  "items",
  "passives",
  "custom",
]);
const VALID_SECTIONS = new Set(["mobility", "offense", "support"]);
const VALID_KINDS = new Set(["action", "bonus", "reaction", "utility"]);
const VALID_TIERS = new Set(["C", "I", "II", "III", "IV", "V"]);
const VALID_TONES = new Set([
  "steel",
  "red",
  "gold",
  "blue",
  "purple",
  "green",
  "neutral",
]);
const VALID_ICON_GROUPS = new Set([
  "common",
  "weapons",
  "spells",
  "items",
  "passives",
  "custom",
]);
const VALID_ICON_EXTENSIONS = new Set([".webp", ".png", ".jpg", ".jpeg"]);
const VALID_ICON_MIME_TYPES = new Set([
  "image/webp",
  "image/png",
  "image/jpeg",
]);

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 50,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (
      !VALID_ICON_EXTENSIONS.has(extension) ||
      !VALID_ICON_MIME_TYPES.has(file.mimetype)
    ) {
      callback(new Error(`Unsupported image type for ${file.originalname}`));
      return;
    }

    callback(null, true);
  },
});

app.use(express.json({ limit: "250mb" }));

const withForwardSlashes = (value) => value.split(path.sep).join("/");

const sanitizeFileNameStem = (rawName) => {
  const normalized = rawName
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_.-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "icon";
};

const sanitizeAbilityId = (rawId) =>
  rawId
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeIconKey = (iconKey) => iconKey.replace(/\\/g, "/").trim();

// Sync shape validator shared between the read path (filter bad
// entries off disk) and the write path (reject bad payloads). Does
// not touch the filesystem — the icon-existence check is layered on
// top by validateAbilityPayload.
const validateAbilityShape = (rawAbility) => {
  if (!rawAbility || typeof rawAbility !== "object") {
    throw new Error("Ability must be an object.");
  }

  const id = sanitizeAbilityId(String(rawAbility.id ?? ""));
  const name = String(rawAbility.name ?? "").trim();
  const short = String(rawAbility.short ?? "").trim();
  const category = String(rawAbility.category ?? "").trim();
  const section = String(rawAbility.section ?? "").trim();
  const kind = String(rawAbility.kind ?? "").trim();
  const tier = String(rawAbility.tier ?? "").trim();
  const tone = String(rawAbility.tone ?? "").trim();
  const keybind = String(rawAbility.keybind ?? "").trim();
  const icon = rawAbility.icon ? normalizeIconKey(String(rawAbility.icon)) : "";

  if (!id) throw new Error("Ability id is required.");
  if (!name) throw new Error("Ability name is required.");
  if (!short) throw new Error("Ability short label is required.");
  if (!VALID_CATEGORIES.has(category)) throw new Error(`Invalid category: ${category}`);
  if (!VALID_SECTIONS.has(section)) throw new Error(`Invalid section: ${section}`);
  if (!VALID_KINDS.has(kind)) throw new Error(`Invalid kind: ${kind}`);
  if (!VALID_TIERS.has(tier)) throw new Error(`Invalid tier: ${tier}`);
  if (!VALID_TONES.has(tone)) throw new Error(`Invalid tone: ${tone}`);

  if (icon) {
    if (icon.startsWith("/") || icon.includes("..")) {
      throw new Error("Invalid icon path.");
    }
  }

  return {
    id,
    name,
    short,
    category,
    section,
    kind,
    tier,
    tone,
    ...(keybind ? { keybind } : {}),
    ...(icon ? { icon } : {}),
  };
};

const readManifest = async () => {
  const raw = await fs.readFile(ACTIONS_MANIFEST_PATH, "utf8");
  const parsed = JSON.parse(raw);
  const rawAbilities = Array.isArray(parsed?.abilities) ? parsed.abilities : [];

  // Drop hand-edited entries that don't match the schema before the
  // UI ever sees them. Log once per bad entry so the warning is
  // visible in dev output without stopping the server.
  const abilities = [];
  for (const candidate of rawAbilities) {
    try {
      abilities.push(validateAbilityShape(candidate));
    } catch (error) {
      const id = candidate?.id ?? "<unknown>";
      console.warn(
        `[asset-manager-api] dropping malformed ability "${id}": ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }
  }

  return {
    version: Number(parsed?.version ?? 1),
    abilities,
  };
};

const writeManifest = async (manifest) => {
  const manifestDir = path.dirname(ACTIONS_MANIFEST_PATH);
  const tempPath = path.join(
    manifestDir,
    `actions-manifest.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`,
  );

  await fs.writeFile(
    tempPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  await fs.rename(tempPath, ACTIONS_MANIFEST_PATH);
};

const getAllIconKeys = async () => {
  const collected = [];

  const walk = async (directoryPath) => {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      const extension = path.extname(entry.name).toLowerCase();

      if (!VALID_ICON_EXTENSIONS.has(extension)) {
        continue;
      }

      const relativeKey = withForwardSlashes(
        path.relative(ACTIONS_ASSET_ROOT, fullPath),
      );
      collected.push(relativeKey);
    }
  };

  await walk(ACTIONS_ASSET_ROOT);
  collected.sort((a, b) => a.localeCompare(b));

  return collected;
};

const ensureManifestExists = async () => {
  await fs.mkdir(path.dirname(ACTIONS_MANIFEST_PATH), { recursive: true });
  await fs.mkdir(ACTIONS_ASSET_ROOT, { recursive: true });

  try {
    await fs.access(ACTIONS_MANIFEST_PATH);
  } catch {
    await writeManifest({
      version: 1,
      abilities: [],
    });
  }
};

const validateAbilityPayload = async (rawAbility) => {
  const shape = validateAbilityShape(rawAbility);

  if (shape.icon) {
    const iconAbsolutePath = path.resolve(ACTIONS_ASSET_ROOT, shape.icon);

    if (!isPathInside(ACTIONS_ASSET_ROOT, iconAbsolutePath)) {
      throw new Error("Icon path escapes assets directory.");
    }

    try {
      await fs.access(iconAbsolutePath);
    } catch {
      throw new Error(`Icon file not found: ${shape.icon}`);
    }
  }

  return shape;
};

app.get("/api/asset-manager/manifest", async (request, response, next) => {
  try {
    const manifest = await readManifest();
    response.json(manifest);
  } catch (error) {
    next(error);
  }
});

app.get("/api/asset-manager/icons", async (request, response, next) => {
  try {
    const icons = await getAllIconKeys();
    response.json({ icons });
  } catch (error) {
    next(error);
  }
});

app.post(
  "/api/asset-manager/upload-icons",
  upload.array("icons"),
  async (request, response, next) => {
    try {
      const targetGroup = String(request.body.group ?? "").trim();

      if (!VALID_ICON_GROUPS.has(targetGroup)) {
        response.status(400).json({
          message:
            "Invalid icon group. Use common, weapons, spells, items, passives, or custom.",
        });
        return;
      }

      const files = Array.isArray(request.files) ? request.files : [];

      if (files.length === 0) {
        response.status(400).json({
          message: "No files uploaded.",
        });
        return;
      }

      const destinationDirectory = path.join(ACTIONS_ASSET_ROOT, targetGroup);
      await fs.mkdir(destinationDirectory, { recursive: true });

      const uploaded = [];

      for (const file of files) {
        const extension = path.extname(file.originalname).toLowerCase();
        const baseName = sanitizeFileNameStem(
          path.basename(file.originalname, extension),
        );
        let fileName = `${baseName}${extension}`;
        let destinationPath = path.join(destinationDirectory, fileName);
        let duplicateCounter = 2;

        while (true) {
          try {
            await fs.access(destinationPath);
            fileName = `${baseName}-${duplicateCounter}${extension}`;
            destinationPath = path.join(destinationDirectory, fileName);
            duplicateCounter += 1;
          } catch {
            break;
          }
        }

        await fs.writeFile(destinationPath, file.buffer);

        uploaded.push({
          fileName,
          iconKey: withForwardSlashes(path.join(targetGroup, fileName)),
        });
      }

      response.json({
        uploaded,
      });
    } catch (error) {
      next(error);
    }
  },
);

app.post("/api/asset-manager/abilities", async (request, response, next) => {
  try {
    const validatedAbility = await validateAbilityPayload(request.body);
    const manifest = await readManifest();
    const existingIndex = manifest.abilities.findIndex(
      (ability) => ability.id === validatedAbility.id,
    );
    const mode = existingIndex === -1 ? "created" : "updated";

    if (existingIndex === -1) {
      manifest.abilities.push(validatedAbility);
    } else {
      manifest.abilities[existingIndex] = validatedAbility;
    }

    await writeManifest({
      ...manifest,
      version: Number(manifest.version ?? 1),
      abilities: manifest.abilities,
    });

    response.json({
      mode,
      ability: validatedAbility,
    });
  } catch (error) {
    next(error);
  }
});

registerJournalRoutes(app);

app.get("/api/state/:characterId", (request, response, next) => {
  try {
    const characterId = request.params.characterId;

    if (!isValidCharacterId(characterId)) {
      response.status(400).json({ message: "Invalid character id." });
      return;
    }

    const row = getCharacterStateStmt.get(characterId);

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

    upsertCharacterStateStmt.run(
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

    const existingRow = getCharacterStateStmt.get(characterId);
    const existingState = existingRow ? JSON.parse(existingRow.state_json) : {};
    const mergedState = { ...existingState, ...request.body };

    upsertCharacterStateStmt.run(
      characterId,
      JSON.stringify(mergedState),
      Date.now(),
    );

    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post(
  "/api/state/:characterId/moodboard/snapshots",
  (request, response, next) => {
    try {
      const characterId = request.params.characterId;

      if (!isValidCharacterId(characterId)) {
        response.status(400).json({ message: "Invalid character id." });
        return;
      }

      const row = getCharacterStateStmt.get(characterId);

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

      const result = insertMoodboardSnapshotStmt.run(
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

      const rows = listMoodboardSnapshotsStmt.all(characterId);
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

      const row = getMoodboardSnapshotStmt.get(characterId, snapshotId);

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

      const result = deleteMoodboardSnapshotStmt.run(characterId, snapshotId);

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

app.use((error, request, response, _next) => {
  const status = Number(error?.status) || Number(error?.statusCode) || 400;
  const message = error instanceof Error ? error.message : "Unknown API error.";
  response.status(status).json({ message });
});

await ensureManifestExists();
await ensureNotesDirectoryExists();

app.listen(PORT, () => {
  console.log(`[asset-manager-api] listening on http://localhost:${PORT}`);
});
