# Character Journal — Design

A new tab in the v2 UI for keeping markdown journal entries. Notes persist as `.md` files on disk via the existing asset-manager Express server. Users edit raw markdown and toggle to a rendered preview. Notes are listed in a left sidebar with tag chips and a sort dropdown; the selected note is shown on the right.

## Goals

- Add a `/v2/journal` tab reachable from `V2TabBar`.
- Persist entries as `.md` files with YAML frontmatter in a top-level `notes/` directory.
- Edit ↔ Preview toggle on the active note.
- Notes-list sidebar with: predefined tag chips, free-form tag entry, sortable list (last-modified default).
- D&D-style theming: v2 dark frame in the chrome, parchment content area for the note body.

## Non-goals (YAGNI)

- Cross-note search.
- File-watching for external edits — refresh on tab focus / page load only.
- Multi-user collaboration, conflict resolution.
- Drag-to-reorder.
- Note attachments / image uploads.
- Automated tests (project has no test infrastructure; deferred).

## Architecture

Three layers:

1. **Backend** — five new endpoints on the existing `scripts/asset-manager-server.mjs` (port 5180). Vite's existing `/api` proxy handles forwarding.
2. **Storage** — top-level `notes/` directory at the repo root. One `.md` file per note. `notes/.gitkeep` checked in; the actual `.md` files can be gitignored later if desired.
3. **Frontend** — new page `V2Journal.jsx` plus a `src/v2/components/journal/` component family. State held locally in `V2Journal`; no global store.

## File format

Each note is a markdown file with YAML frontmatter:

```markdown
---
id: tavern-rumors-a3f9
title: Tavern Rumors
tags: [Lore, NPC, waterdeep]
created: 2026-04-28T10:30:00.000Z
updated: 2026-04-28T11:45:00.000Z
---

# Yawning Portal

The barkeep mentioned a cloaked stranger asking about the **Stone of Golorr**...
```

- **Filename:** `<id>.md`. Filenames never change after creation.
- **`id`:** generated server-side as `<slug-of-title>-<4-char-random-hex>`. Stable for the life of the note. Sanitized to `[a-z0-9-]`.
- **`tags`:** flat array of strings. Predefined chips and free-form entries coexist as plain strings — chips are UI shortcuts that drop their label into the array.
- **Predefined chip set:** `Lore, Quest, NPC, Location, Item, Combat, Session, Player`.
- **Timestamps:** ISO 8601 strings, server-managed only. Client never writes these.

## Backend API

All endpoints under `/api/journal`, served by the existing asset-manager Express app.

| Method | Path | Body | Returns |
|---|---|---|---|
| `GET` | `/api/journal/notes` | — | `{ notes: [{id, title, tags, created, updated}] }` (no body field, fast for sidebar) |
| `GET` | `/api/journal/notes/:id` | — | `{ id, title, tags, created, updated, body }` |
| `POST` | `/api/journal/notes` | `{ title, tags?, body? }` | full note |
| `PUT` | `/api/journal/notes/:id` | `{ title?, tags?, body? }` | full note |
| `DELETE` | `/api/journal/notes/:id` | — | `{ deleted: id }` |

### Validation & safety

- `id` URL params sanitized with the same pattern as `sanitizeAbilityId()` and resolved via `path.resolve()` + `isPathInside()` to keep filesystem access inside `notes/` only.
- `title` ≤ 200 chars, trimmed, required on create.
- `body` ≤ 1 MB.
- `tags` ≤ 20 entries; each tag trimmed, ≤ 40 chars, `[a-zA-Z0-9 _-]` only.
- File writes use the temp-file + `fs.rename()` pattern from `writeManifest()` so concurrent saves don't tear files.
- 404 for unknown ids; 400 for validation errors via the existing error-handler middleware.

### Frontmatter handling

Use `gray-matter` on the server to parse and serialize. New dependency. Body is raw markdown; frontmatter object is the metadata.

## Frontend

### File layout

```
src/v2/
  pages/
    V2Journal.jsx                  page-level orchestration & state
  components/journal/
    JournalSidebar.jsx             sort dropdown, tag chips, note list, "+ New"
    JournalNoteList.jsx            scrollable list (title, leading tag, relative time)
    JournalNoteView.jsx            right pane: header (title, tags, delete), body
    JournalEditor.jsx              textarea (Edit mode)
    JournalRenderer.jsx            react-markdown wrapper (Preview mode)
    JournalTagInput.jsx            chip row + free-form input
  data/
    journalApi.js                  fetch wrappers for the 5 endpoints
  styles/
    v2-journal.scss                all journal styling
```

### State & data flow

`V2Journal` owns:

- `notes: NoteSummary[]` — sidebar metadata.
- `selectedId: string | null`.
- `selectedNote: Note | null` — full content, lazily loaded.
- `editMode: boolean` — defaults to false (Preview).
- `sortBy: 'updated' | 'created' | 'title'` — defaults to `'updated'` desc.
- `tagFilter: string | null` — single active tag, null = show all.

Flow:

- Mount → `GET /notes` → populate sidebar.
- Click a note → `GET /notes/:id` → populate right pane, set Preview mode.
- **Toggle to Preview saves** the current edit (`PUT /notes/:id`) and refreshes the sidebar metadata so order updates.
- Title and tag edits live above the body and save on blur (separate `PUT`).
- "+ New" → `POST` with `title: "Untitled"`, empty body — server returns the new note, client selects it and switches to Edit mode.
- Delete → confirm dialog → `DELETE` → drop from sidebar, clear selection.
- Sort & tag filter are pure client-side over the loaded sidebar list.

### Routing

Add to `src/Router.jsx`:

```jsx
<Route path="journal" element={<V2Journal />} />
```

Add a `Journal` entry to `V2TabBar`.

### Two distinct uses of "tag chips"

These look similar but serve different roles:

- **Sidebar filter chips** (in `JournalSidebar`): built dynamically from the union of tags across all loaded notes. Click one to filter the note list to notes carrying that tag. Click again (or click an "All" chip) to clear.
- **Per-note tag input chips** (in `JournalTagInput`): the eight predefined chips (`Lore, Quest, NPC, Location, Item, Combat, Session, Player`) plus a free-form text input. Click a predefined chip to add it to the active note's tag list; type into the input + Enter to add a custom tag. Each tag on the note has an "x" to remove it.

### Always-visible header on the right pane

Regardless of Edit/Preview mode, the right-pane header always shows:

- Title input (saves on blur).
- `JournalTagInput` row (saves on each add/remove).
- Edit/Preview toggle button.
- Delete button (browser-native `window.confirm()` before firing `DELETE`).

Only the body area below the header swaps between `JournalEditor` (textarea) and `JournalRenderer` (rendered markdown).

## Theming

Hybrid approach (v2 dark frame, parchment content area).

- **Sidebar:** matches existing v2 panel — dark background, gold accents, same typography for the note titles, tag chips styled like existing tier/tone chips.
- **Right pane chrome:** dark v2 surface for the title bar, tag input, and Edit/Preview toggle. Toggle styled as a wax-seal-style button (red accent for Edit, gold for Preview).
- **Note body container:** parchment look — warm cream background (`#f4ead2`-ish), serif body font (system serif stack with Crimson / EB Garamond fallback), inset shadow giving a paper feel, dark ink color for text (`#2a1c10`).
- **Markdown elements inside body:** headings get a subtle gold underline, blockquotes get a left bar in the existing v2 gold, code blocks keep a darker contrast.
- All styling lives in `v2-journal.scss`, reusing existing v2 SCSS variables where possible.

## Dependencies to add

- `react-markdown` — markdown → React rendering. Battle-tested, small.
- `gray-matter` — server-side YAML frontmatter parsing/serialization.

Both are tiny additions; nothing else from the existing stack changes.

## Verification (manual)

1. `npm run dev:assets` — confirm `[asset-manager-api]` line in console.
2. Navigate to `/v2/journal`.
3. Click "+ New" — note appears, opens in Edit mode.
4. Type body, add tag chips and a free-form tag, set title.
5. Toggle to Preview — markdown renders with parchment styling.
6. Confirm `notes/<id>.md` exists on disk with the content + frontmatter.
7. Toggle sort dropdown — list reorders.
8. Click a tag chip in the sidebar — list filters.
9. Delete a note — file is gone from disk and sidebar.
10. Restart `dev:assets`, navigate back — notes persist.

## Open issues / future work

- Cross-note search.
- Wiki-style `[[note-id]]` links between notes.
- Image / attachment uploads (could share the asset-manager upload endpoint).
- Tag rename / merge.
