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
- [x] **Background** (`/v2/background`) — battle-map image upload.
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
- [ ] **Pets** — track pet HP, actions, etc. Not started.

A `/legacy/*` route still mounts the original (pre-v2) UI for
reference; toggle between them with the Version Switcher in the
top-right.

## Installation

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
| `npm run lint` | ESLint over `src/` and `scripts/`. |

## Architecture at a glance

```
src/
  v2/             — current UI (default mount; routed under /v2/*)
    api/          — HTTP clients for the local API server
    components/   — UI components grouped by feature
    hooks/        — generic hooks (useDebouncedSave, …)
    layout/       — V2Layout shell, left panel, tab bar
    pages/        — route components
    styles/       — SCSS organised by feature
    data/         — actions catalog + manifest
  legacy/         — pre-v2 UI, mounted under /legacy/* (reference only)
  components/     — shared (VersionSwitcher)
  data/           — shared character data
  assets/         — shared images
scripts/
  asset-manager-server.mjs  — local API entrypoint (port 5180)
  server/
    journal.mjs   — journal endpoints + helpers
    utils.mjs     — shared server helpers (path-safe checks)
notes/            — markdown journal entries (.md per note)
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
