import express from "express";
import path from "node:path";
import {
  registerJournalRoutes,
  ensureNotesDirectoryExists,
} from "./journal.mjs";
import {
  createAssetManagerStore,
  registerAssetManagerRoutes,
} from "./asset-manager.mjs";
import {
  createStateStore,
  registerStateRoutes,
  registerMoodboardSnapshotRoutes,
} from "./state.mjs";

// Optional .env in the project root (see .env.example).
try {
  process.loadEnvFile();
} catch {
  // No .env — defaults apply.
}

// ASSET_MANAGER_PORT is the variable's pre-rename name.
const PORT = Number(
  process.env.API_PORT || process.env.ASSET_MANAGER_PORT || 5180,
);
const ROOT_DIR = process.cwd();
const ACTIONS_MANIFEST_PATH = path.join(
  ROOT_DIR,
  "src",
  "data",
  "actions-manifest.json",
);
const ACTIONS_ASSET_ROOT = path.join(ROOT_DIR, "src", "assets", "actions");

const app = express();
app.use(express.json({ limit: "250mb" }));

const assetManager = createAssetManagerStore({
  manifestPath: ACTIONS_MANIFEST_PATH,
  assetRoot: ACTIONS_ASSET_ROOT,
});
registerAssetManagerRoutes(app, {
  ...assetManager,
  assetRoot: ACTIONS_ASSET_ROOT,
});

const stateStore = createStateStore({ rootDir: ROOT_DIR });
registerStateRoutes(app, stateStore);
registerMoodboardSnapshotRoutes(app, stateStore);

registerJournalRoutes(app);

app.use((error, request, response, _next) => {
  const status = Number(error?.status) || Number(error?.statusCode) || 400;
  const message = error instanceof Error ? error.message : "Unknown API error.";
  response.status(status).json({ message });
});

await assetManager.ensureManifestExists();
await ensureNotesDirectoryExists();

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});
