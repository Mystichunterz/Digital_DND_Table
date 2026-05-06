import express from "express";
import path from "node:path";
import {
  registerJournalRoutes,
  ensureNotesDirectoryExists,
} from "./server/journal.mjs";
import {
  createAssetManagerStore,
  registerAssetManagerRoutes,
} from "./server/asset-manager.mjs";
import {
  createStateStore,
  registerStateRoutes,
  registerMoodboardSnapshotRoutes,
} from "./server/state.mjs";

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
  console.log(`[asset-manager-api] listening on http://localhost:${PORT}`);
});
