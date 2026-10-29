# Digital DND Table v2.0.0

A personal D&D companion app: BG3-styled character sheet, action HUD,
spellbook, journal, and asset uploads. React 18 + Vite frontend with a
small local Express + SQLite API server for persistence.

Heavy inspiration is taken from Baldur's Gate 3 in terms of UI design
and functionality. Many of the icons are sourced from the BG3 wiki.

## Features

- [x] **Character sidebar** — name, class, level, resistances,
      conditions, features (with hover popups for each).
- [x] **Overview HUD** (`/overview`) — health panel, draggable Actions
      panel, spellcasting modifiers, proficiencies, and resource pips
      (action / bonus / reaction / channel oath, lay on hands,
      sorcery points, divine sense, spell slots — persisted to a
      local SQLite database per character).
- [x] **Spellbook** — full spell list with hover popups for each
      spell description.
- [x] **Asset Manager** (`/assets`) — bulk-upload icons by category
      (`common` / `weapons` / `spells` / `items` / `passives` /
      `custom`) and edit ability metadata. Writes to
      `src/assets/actions/*` and `src/data/actions-manifest.json`;
      the Actions panel reads this manifest and resolves icons
      automatically — no code edits needed to add an ability.
- [x] **Inventory** (`/inventory`) — paper-doll equipment slots,
      bag grid with category filter + search, carry weight, and a
      combat readout. Item data lives in `src/data/character/inventory.js`.
- [x] **Background** (`/background`) — identity, personality and
      backstory panels, plus a moodboard: drop in images (downscaled
      client-side), place stickers, and save/restore named snapshots
      (persisted to SQLite).
- [x] **Journal** (`/journal`) — markdown notes with YAML
      frontmatter, full-text search, tag filters, debounced auto-save,
      and an Edit ↔ Preview toggle. Notes persist as `.md` files
      under `notes/`.
- [x] **Calculator** (`/calculator`) — Avrae-compatible dice
      command generator. Type a formula (`1d20+{PROF}+{STR}`),
      click dice or token chips to insert, copy the resolved
      `!roll` command into Discord. Tracks recent commands for
      one-click replay. Reads live ability modifiers from the
      character context, so token substitution stays in sync.
- [ ] **Companions** (`/companions`) — read-only stat cards for
      pets and mounts from `src/data/character/companions.js`. HP and
      action tracking not started yet.

Old `/v2/...` links redirect to the same page without the prefix. The
pre-v2 "legacy" UI has been removed; the last commit that has it is
tagged `legacy-ui-final`.

## Installation

Requires Node 20.12 or newer (`better-sqlite3` ships prebuilt binaries
for current Node releases).

```bash
git clone https://github.com/Mystichunterz/Digital_DND_Table.git
cd Digital_DND_Table
npm install
```

Optionally copy `.env.example` to `.env` to run the API on another port
(`API_PORT`); the Vite dev proxy reads the same file, so the two stay in
sync.

## Running

```bash
npm run dev
```

Boots both the Vite dev server (port 5173) and the local API server
(port 5180) via `concurrently`. Open `http://localhost:5173`.

Other scripts:

| Script                                              | Purpose                                                                           |
| --------------------------------------------------- | --------------------------------------------------------------------------------- |
| `npm run dev`                                       | Frontend + API together (the usual one).                                          |
| `npm run dev:web`                                   | Vite only — useful if you don't need persistence.                                 |
| `npm run dev:api`                                   | API only — `node server/index.mjs`.                                               |
| `npm run build`                                     | Production build to `dist/`.                                                      |
| `npm run preview`                                   | Serve the production build locally.                                               |
| `npm run lint`                                      | ESLint over the whole repo.                                                       |
| `npm run format`                                    | Prettier over `src/`, `server/` and `scripts/` (`format:check` to verify only).   |
| `npm test`                                          | Vitest, single run (`npm run test:watch` to watch).                               |
| `npm run backup:moodboard -- [characterId] [label]` | Snapshot the current moodboard into SQLite (`characterId` defaults to `default`). |

## Architecture at a glance

```
src/
  main.jsx          entry: global CSS + <App />
  app/              App, Router, AppLayout shell, TabBar, NotFoundPage,
                    PersistenceIndicator
  features/         one folder per tab: page, panels, hooks, tests,
                    <feature>.scss + styles/ partials
    overview/       HUD panels; actions/ (action grid), spellbook/,
                    resource-pips/
    inventory/  background/ (moodboard/)  companions/  calculator/
    journal/  asset-manager/  character-sidebar/
  components/popups/  shared BG3-style hover popups, each with its styles
  state/            React contexts, useCharacterStateHydration,
                    usePersistedDebounce
  api/              HTTP clients for the local API (characterState,
                    moodboard, journal, assetManager)
  data/             game catalogs: actions + manifest, conditions
    character/      Sariel's sheet: scores, features, skills, stats,
                    inventory, companions, background, spellbook tabs
  lib/              dice formula + Avrae helpers
  styles/           design tokens, global CSS, shared panel styles
  assets/           images (action icons resolve by path via the manifest)
  test/             test-utils (renderWithProviders, stubFetch)
server/
  index.mjs         local API entrypoint (port 5180)
  asset-manager.mjs, journal.mjs, state.mjs, utils.mjs
scripts/            one-off CLI tools (moodboard backup, icon fetcher)
notes/              markdown journal entries, one .md per note (gitignored)
data/               local SQLite database for character state (gitignored)
references/         character sheet + other reference material
```

The Vite dev server proxies `/api/*` to the API server.

### Conventions

- Import across top-level folders with the `@/` alias
  (`@/state/...`, `@/api/...`); use relative paths inside a feature.
- A new tab is a `src/features/<name>/` folder with a `<Name>Page.jsx`
  and `<name>.scss`, registered in `src/app/Router.jsx` and
  `src/app/TabBar.jsx`.
- Panels use the `.panel` / `.panel-header` card from
  `src/styles/panels.scss`; add the page's class to the palette selector
  there, or the card renders without its border and background.
- Per-character persistence: load with `useCharacterStateHydration`,
  save with `usePersistedDebounce({ url: characterStateUrl(), ... })`.

## Contributing

### Committing

Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
standard with a scoped prefix — e.g. `feat(journal): …`,
`refactor(overview): …`, `chore(character): …`. The git log reads as a
narrative this way.

### Versioning

The project uses [Semantic Versioning](https://semver.org/). Bump the
version in this README and `package.json` when shipping changes.
