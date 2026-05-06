import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { isPathInside } from "./utils.mjs";

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

export const createAssetManagerStore = ({ manifestPath, assetRoot }) => {
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

  const readManifest = async () => {
    const raw = await fs.readFile(manifestPath, "utf8");
    const parsed = JSON.parse(raw);
    const rawAbilities = Array.isArray(parsed?.abilities)
      ? parsed.abilities
      : [];

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
    const manifestDir = path.dirname(manifestPath);
    const tempPath = path.join(
      manifestDir,
      `actions-manifest.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`,
    );

    await fs.writeFile(
      tempPath,
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8",
    );
    await fs.rename(tempPath, manifestPath);
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
          path.relative(assetRoot, fullPath),
        );
        collected.push(relativeKey);
      }
    };

    await walk(assetRoot);
    collected.sort((a, b) => a.localeCompare(b));

    return collected;
  };

  const ensureManifestExists = async () => {
    await fs.mkdir(path.dirname(manifestPath), { recursive: true });
    await fs.mkdir(assetRoot, { recursive: true });

    try {
      await fs.access(manifestPath);
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
      const iconAbsolutePath = path.resolve(assetRoot, shape.icon);

      if (!isPathInside(assetRoot, iconAbsolutePath)) {
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

  return {
    upload,
    readManifest,
    writeManifest,
    getAllIconKeys,
    ensureManifestExists,
    validateAbilityPayload,
  };
};

export const registerAssetManagerRoutes = (
  app,
  { upload, readManifest, writeManifest, getAllIconKeys, validateAbilityPayload, assetRoot },
) => {
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

        const destinationDirectory = path.join(assetRoot, targetGroup);
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
};
