# Digital DND Table — Project State Analysis

*Snapshot as of 2026-04-28.*

## TL;DR

A personal-use D&D companion app, React 18 + Vite frontend, with a small Express side-server for asset uploads and journal persistence. Single-character, single-user, BG3-styled. The active codebase is `src/v2/`; an older `src/legacy/` tree is kept around but not where new work goes. Three substantive features are wired end-to-end: the v2 Overview HUD (character sidebar + actions panel), the Asset Manager (icon uploads + ability metadata), and the Journal (markdown notes with auto-save and search). Several README-listed features (Character Sheet detail, Calculator, Pets) remain unstarted. No tests, no character-data persistence yet, dual codebase.

## What's implemented

### Working features
- **v2 Overview page** (`/v2/overview`) — character sidebar (name, class, level, resistances, conditions), draggable Actions panel reading from a JSON manifest, Spellcasting panel, Health panel, Proficiencies panel.
- **Spell hover popups** — hovering a spell in the spellbook shows full description.
- **Asset Manager** (`/v2/assets`) — bulk icon upload by category (`common`, `weapons`, `spells`, `items`, `passives`, `custom`), CRUD form for ability entries, persists to `src/v2/data/actions-manifest.json`.
- **Background page** (`/v2/background`) — battle-map background image upload.
- **Journal** (`/v2/journal`) — full CRUD over markdown notes:
  - Notes persist as `.md` files with YAML frontmatter in `notes/`.
  - Sidebar with sort dropdown (last modified / created / title), tag filter chips (built dynamically from notes' tags), search bar matching title + tags + body.
  - Right pane with title input, predefined + free-form tag chips, Edit ↔ Preview toggle, parchment-styled body.
  - Debounced auto-save (`useDebouncedSave`) on title and body; tags save instantly.
  - Status pill ("Saving…" / "Saved") in the header.
- **Legacy routes** (`/legacy/*`) still mount and serve their old views.

### Backend surface
A single Express server in `scripts/asset-manager-server.mjs` on port 5180, exposed to Vite via `/api` proxy. Endpoints:

| Group | Method + Path | Purpose |
|---|---|---|
| Assets | `GET /api/asset-manager/manifest` | Read ability manifest |
| Assets | `GET /api/asset-manager/icons` | List icon keys |
| Assets | `POST /api/asset-manager/upload-icons` | Multipart icon upload (≤ 50 files / 5 MB each) |
| Assets | `POST /api/asset-manager/abilities` | Create or update an ability |
| Journal | `GET /api/journal/notes[?include=body]` | List notes summaries |
| Journal | `GET /api/journal/notes/:id` | Read one note |
| Journal | `POST /api/journal/notes` | Create a note |
| Journal | `PUT /api/journal/notes/:id` | Update a note (partial OK) |
| Journal | `DELETE /api/journal/notes/:id` | Delete a note |

## Architecture

### Frontend
SPA with React Router 7. `/` redirects to `/v2/overview`. Two parallel mount points:

- `src/v2/` — current UI. `V2Layout` shell holds a left character panel (`V2LeftPanel`) and a right pane with `V2TabBar` and a route outlet. Pages: `V2Overview`, `V2Background`, `V2AssetManager`, `V2Journal`. Components live under `src/v2/components/` grouped by page (`pages/overview/...`, `journal/...`, `popups/...`). Styles in `src/v2/styles/*.scss`.
- `src/legacy/` — older shell + pages, still routable. No active work.

State is local to pages — no global store, no Redux/Zustand. Inter-component communication is plain props and callbacks.

### Backend
The Express server combines two unrelated domains (asset manager + journal) in one file. ~640 lines. Shared helpers (`isPathInside`, temp+rename atomic write pattern) are reused across both domains.

### Data shape
- **Abilities** — single JSON file `src/v2/data/actions-manifest.json` listing every ability with `{id, name, short, category, section, kind, tier, tone, keybind?, icon?}`.
- **Icons** — files under `src/assets/actions/<group>/`. Manifest references them by relative path.
- **Notes** — one `<id>.md` per note in `notes/`, frontmatter (`id, title, tags, created, updated`) + markdown body. Filenames stable; renames don't move files.

## Tech stack

- **Runtime** — React 18.3, React Router 7.1, React Draggable, React Resizable, react-markdown 10.
- **Build** — Vite 6 with `@vitejs/plugin-react`, sass-embedded for SCSS.
- **Backend** — Express 5, Multer 2 (file upload), gray-matter 4 (frontmatter).
- **Tooling** — ESLint 9, Prettier 3, concurrently for `dev:assets`.
- **Node version** — implied by ESM imports + `node:` prefixed builtins; running fine on whatever Node the user has.

## Patterns worth keeping

1. **Manifest-driven UI** — `V2ActionsPanel` renders entirely from `actions-manifest.json`. Adding a new ability needs no code, just a manifest entry + icon. The Asset Manager UI is the proof.
2. **Atomic file writes via temp + rename** — used for both manifest and note saves. Prevents torn writes on crash.
3. **`useDebouncedSave` hook** — single source of truth for any field that needs typed-then-persist behaviour. Owns local draft, fires save on idle, flushes on unmount. Reused by title and body in the journal; trivially extensible to future inputs.
4. **Conventional commits with scoped prefixes** (`feat(journal):`, `fix(spells):`, `chore(...)`). The git log is readable and tells the story of the project well.
5. **`docs/superpowers/specs/` + `docs/superpowers/plans/`** — design docs and implementation plans co-located, dated, and committed. Helpful audit trail.
6. **Server-side input safety** — every endpoint that resolves a filesystem path runs it through `isPathInside()` and a regex sanitizer (`sanitizeAbilityId`, `sanitizeNoteId`). The pattern is consistent.

## Gaps and technical debt

### Functional gaps
- **No character persistence.** Character data (name, class, level, ability scores, resistances, conditions, features) is currently hard-coded in component files (`src/v2/data/...`, `src/data/...` for legacy). There's no equivalent of the Asset Manager / Journal pattern for the character sheet itself. To support multiple characters or even a single editable character, this needs a `characters/` data dir + endpoints, mirroring the journal pattern.
- **Spellbook is read-only.** Spells are static data; no creation/edit flow.
- **Calculator (Avrae dice command generator)** — listed in README, not started.
- **Pets** — listed in README, not started.

### Code-level debt
- **Dual codebase.** `src/legacy/*` still mounts and is reachable at `/legacy/*`. Worth a final pass to confirm nothing in v2 still depends on it, then delete.
- **`asset-manager-server.mjs` is now mixed-domain.** It hosts both asset endpoints and journal endpoints (~640 lines). Splitting into `scripts/server/journal.mjs` + `scripts/server/asset-manager.mjs` + a thin entrypoint that mounts both keeps each module focused as more endpoints land.
- **No tests.** No `*.test.*` / `*.spec.*` files, no Vitest setup, no testing-library. This is acceptable for personal use but means every refactor relies on manual exercise. A minimal Vitest config + a few high-value tests (manifest validation, journal frontmatter parsing, `useDebouncedSave` flush behaviour) would catch a lot.
- **Bundle size.** Production build emits a ~670 KB single chunk (gzip ~260 KB), and Vite warns about it. Code-splitting v2 vs legacy and lazy-loading the Asset Manager page would push the initial bundle well under 500 KB.
- **CRLF noise on commits.** Every commit on Windows logs LF→CRLF warnings. Adding `.gitattributes` with `* text=auto eol=lf` (and forcing LF on `*.scss`/`*.jsx`/`*.js`/`*.mjs`) silences the warnings and keeps the repo cross-platform clean.
- **`notes/*.md` files are tracked in git.** Reasonable for a single-user repo, but every note becomes a commit. If the journal is meant to be personal data rather than canonical campaign content, gitignore `notes/*.md` (keep `notes/.gitkeep`).
- **No `.env.example` or environment docs.** The asset-manager port (`ASSET_MANAGER_PORT`) is overrideable but undocumented.
- **README is outdated.** Most feature checkboxes are still empty even though Spellbook, Actions, and Asset Manager have shipped. The Journal isn't mentioned at all.

### Performance / UX
- **Initial journal load fetches every note's body now** (since search needs them). Fine at hundreds of notes; would need a search endpoint at thousands.
- **No optimistic UI on note delete.** Brief flash while the request lands. Minor.
- **No keyboard shortcuts.** No `Ctrl+S` to force-flush, no `Esc` to clear search, no arrow keys to move through the note list. Nice-to-have.
- **Search has no result highlight.** Matches scroll into the list but the matched substring isn't highlighted in titles or rendered body.

## README vs. reality

The README was last touched before most of v2 shipped. Reality:

| README says | Reality |
|---|---|
| `[x] Character Sidebar` | True. |
| `[ ] Character Sheet` | Partially shipped — health, actions, spellcasting, proficiencies are panels in v2 Overview. No standalone "sheet" yet. |
| `[ ] Spellbook` | Shipped (with hover popups, missing icons filled in). |
| `[ ] Calculator` | Not started. |
| `[ ] Background` | Shipped (battle-map upload). |
| `[ ] Pets` | Not started. |
| (not listed) | **Asset Manager** — shipped. |
| (not listed) | **Journal** — shipped (this session). |

The README also says `npm run dev` to launch — but anything touching the journal, asset manager, or background needs `npm run dev:assets`. New users following the README will hit the same `ECONNREFUSED` on `/api/journal/notes` that surfaced earlier today.

## Recommended next steps

In rough priority order:

1. **Refresh the README** — update the feature checklist, add Journal + Asset Manager sections, change the recommended start command to `npm run dev:assets` (or alias `dev` → `dev:assets` in `package.json`). 30 minutes of cleanup that prevents new-user friction.
2. **Decide notes' git status** — either gitignore `notes/*.md` and treat them as personal data, or keep tracking and accept that. Document the choice.
3. **Add `.gitattributes`** to silence CRLF warnings and keep line endings consistent. Two-line file.
4. **Persist character data** — biggest functional gap. Mirror the journal pattern: `characters/<id>.json` files, `/api/characters/*` endpoints, frontend forms for editable fields. Unlocks multi-character support and stops requiring code edits to change levels/stats.
5. **Split the Express server file** — once character endpoints land, the single mjs file will be ~900+ lines. Splitting now is cheap; later it'll require more thought about shared helpers.
6. **Decide legacy's fate** — either commit to deleting `src/legacy/` after a final visual diff, or formalise it as a fallback by linking from the v2 nav. Right now it's neither.
7. **Bundle-split the Asset Manager** — it's the largest individual page and is rarely opened. Lazy-loading it shrinks the initial bundle materially.
8. **Minimal test foothold** — a Vitest config plus two or three tests against `useDebouncedSave` would prevent the next "title save is broken" regression. Doesn't need to be comprehensive — just enough to make adding a test feel cheap.
9. **Calculator (Avrae dice generator)** — small, self-contained feature from the original README. Good cleanup item.

## Open questions for the maintainer

- **Multi-character or single-character?** The character data shape on disk depends on which.
- **Are notes campaign-canonical content (commit) or personal scratch (gitignore)?**
- **Is `legacy/` worth keeping?** Helps shape the next refactor pass.
- **Does the journal want richer features (links between notes, image embeds, search highlight) or stay minimal?**
- **Public-facing eventually, or always personal?** If public, the BG3 wiki icon usage becomes a real licensing question.
