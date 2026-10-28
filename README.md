# Digital DND Table v1.0.1

A personal D&D companion app: BG3-styled character sheet, action HUD,
spellbook, journal, and asset uploads. React 18 + Vite frontend with a
small local Express + SQLite API server for persistence.

Heavy inspiration is taken from Baldur's Gate 3 in terms of UI design
and functionality. Many of the icons are sourced from the BG3 wiki.

## Features

- [x] **Character sidebar** — name, class, level, resistances,
      conditions, features (with hover popups for each).
- [x] **Overview HUD** — health panel, draggable Actions panel,
      spellcasting modifiers, proficiencies, and resource pips
      (action / bonus / reaction / channel oath, lay on hands,
      sorcery points, divine sense, spell slots — persisted to a
      local SQLite database per character).
- [x] **Spellbook** — full spell list with hover popups for each
      spell description.
- [x] **Asset Manager** (`/v2/assets`) — bulk-upload icons by category
      (`common` / `weapons` / `spells` / `items` / `passives` /
      `custom`) and edit ability metadata. Writes to
      `src/assets/actions/*` and `src/v2/data/actions-manifest.json`;
      `V2ActionsPanel` reads this manifest and resolves icons
      automatically — no code edits needed to add an ability.
- [x] **Inventory** (`/v2/inventory`) — paper-doll equipment slots,
      bag grid with category filter + search, carry weight, and a
      combat readout. Item data lives in `src/v2/data/sarielInventory.js`.
- [x] **Background** (`/v2/background`) — identity, personality and
      backstory panels, plus a moodboard: drop in images (downscaled
      client-side), place stickers, and save/restore named snapshots
      (persisted to SQLite).
- [x] **Journal** (`/v2/journal`) — markdown notes with YAML
      frontmatter, full-text search, tag filters, debounced auto-save,
      and an Edit ↔ Preview toggle. Notes persist as `.md` files
      under `notes/`.
- [x] **Calculator** (`/v2/calculator`) — Avrae-compatible dice
      command generator. Type a formula (`1d20+{PROF}+{STR}`),
      click dice or token chips to insert, copy the resolved
      `!roll` command into Discord. Tracks recent commands for
      one-click replay. Reads live ability modifiers from the
      character context, so token substitution stays in sync.
- [ ] **Companions** (`/v2/companions`) — read-only stat cards for
      pets and mounts from `src/v2/data/companionsData.js`. HP and
      action tracking not started yet.

A `/legacy/*` route still mounts the original (pre-v2) UI for
reference; toggle between them with the Version Switcher in the
top-right.

## Installation

Requires Node 20 or newer (`better-sqlite3` ships prebuilt binaries
for current Node releases).

```bash
git clone https://github.com/Mystichunterz/Digital_DND_Table.git
cd Digital_DND_Table
npm install
```

Optionally copy `.env.example` to `.env` if you want a non-default API
port.

## Running

```bash
npm run dev
```

Boots both the Vite dev server (port 5173) and the local API server
(port 5180) via `concurrently`. Open `http://localhost:5173`.

Other scripts:

| Script | Purpose |
|---|---|
| `npm run dev` | Frontend + API together (the usual one). |
| `npm run dev:web` | Vite only — useful if you don't need persistence. |
| `npm run dev:api` | API only — `node scripts/asset-manager-server.mjs`. |
| `npm run build` | Production build to `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | ESLint over the whole repo. |
| `npm run format` | Prettier over `src/` and `scripts/` (`format:check` to verify only). |
| `npm test` | Vitest, single run (`npm run test:watch` to watch). |
| `npm run backup:moodboard -- [characterId] [label]` | Snapshot the current moodboard into SQLite (`characterId` defaults to `default`). |

## Architecture at a glance

```
src/
  v2/             — current UI (default mount; routed under /v2/*)
    components/   — UI components grouped by page, plus popups
    data/         — actions catalog + manifest, character stats,
                    inventory, companions, conditions
    journal/      — self-contained journal feature (UI, state, API client)
    layout/       — V2Layout shell, left panel, tab bar
    pages/        — route components
    state/        — React contexts (character stats, conditions,
                    persistence status) + usePersistedDebounce
    styles/       — SCSS organised by feature
  legacy/         — pre-v2 UI, mounted under /legacy/* (reference only)
  components/     — shared (VersionSwitcher)
  data/           — character data shared by v2 and legacy
  assets/         — shared images
scripts/
  asset-manager-server.mjs  — local API entrypoint (port 5180)
  backup-moodboard.mjs      — CLI moodboard snapshot (npm run backup:moodboard)
  server/
    asset-manager.mjs — icon upload + ability manifest endpoints
    journal.mjs       — journal endpoints + helpers
    state.mjs         — per-character state + moodboard snapshot endpoints
    utils.mjs         — shared server helpers (path-safe checks)
notes/            — markdown journal entries, one .md per note (gitignored)
data/             — local SQLite database for character state (gitignored)
```

The Vite dev server proxies `/api/*` to port 5180.

## Contributing

### Committing

Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
standard with a scoped prefix — e.g. `feat(journal): …`,
`refactor(legacy): …`, `chore(character): …`. The git log reads as a
narrative this way.

### Versioning

The project uses [Semantic Versioning](https://semver.org/). Bump the
version in this README and `package.json` when shipping changes.
