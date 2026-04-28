# Character Journal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/v2/journal` tab where users keep markdown notes persisted as `.md` files on disk, with a sidebar (sort + tag filter + note list) and a right pane (Edit ↔ Preview toggle, parchment-styled body).

**Architecture:** Extend the existing asset-manager Express server (port 5180) with `/api/journal/*` endpoints that read/write `.md` files in `notes/` at the repo root. Frontend is a new React page `V2Journal` with components under `src/v2/components/journal/`. State is local to `V2Journal`; sidebar metadata loaded once, full note bodies fetched on selection.

**Tech Stack:** React 18 + React Router 7, Vite 6, Express 5, `gray-matter` (frontmatter), `react-markdown` (rendering), SCSS (sass-embedded).

**Note on TDD:** The project has no test infrastructure. Per the design spec this feature does not introduce tests. Each task verifies via manual run + commit instead of test-first.

---

## File Structure

**New files:**
- `notes/.gitkeep` — keep the empty directory in git
- `src/v2/data/journalApi.js` — fetch wrappers around the 5 endpoints
- `src/v2/pages/V2Journal.jsx` — page-level state, layout
- `src/v2/components/journal/JournalSidebar.jsx` — sort dropdown + filter + list + new
- `src/v2/components/journal/JournalNoteList.jsx` — scrollable list rows
- `src/v2/components/journal/JournalNoteView.jsx` — right pane: header + body
- `src/v2/components/journal/JournalEditor.jsx` — textarea
- `src/v2/components/journal/JournalRenderer.jsx` — react-markdown wrapper
- `src/v2/components/journal/JournalTagInput.jsx` — predefined chips + free-form input
- `src/v2/styles/v2-journal.scss` — all journal styling

**Modified files:**
- `package.json` — add `gray-matter`, `react-markdown`
- `scripts/asset-manager-server.mjs` — add `/api/journal/*` endpoints (~150 lines appended)
- `src/Router.jsx` — add `journal` route
- `src/v2/layout/V2TabBar.jsx` — add `Journal` tab

---

## Task 1: Add dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime deps**

Run:
```bash
npm install gray-matter react-markdown
```

Expected: `package.json` gains `gray-matter` and `react-markdown` under `dependencies`. `package-lock.json` updates.

- [ ] **Step 2: Verify install**

Run:
```bash
npm ls gray-matter react-markdown
```

Expected: both versions printed without errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(journal): Add gray-matter and react-markdown deps"
```

---

## Task 2: Create notes directory

**Files:**
- Create: `notes/.gitkeep`

- [ ] **Step 1: Create folder and placeholder**

Run:
```bash
mkdir -p notes && touch notes/.gitkeep
```

- [ ] **Step 2: Commit**

```bash
git add notes/.gitkeep
git commit -m "feat(journal): Create notes/ directory for journal entries"
```

---

## Task 3: Backend — journal helpers and constants

**Files:**
- Modify: `scripts/asset-manager-server.mjs`

Add helpers right after the existing `sanitizeAbilityId` block, and import `gray-matter` at the top.

- [ ] **Step 1: Add gray-matter import**

At the top of the file, after `import path from "node:path";`, add:

```js
import matter from "gray-matter";
import crypto from "node:crypto";
```

- [ ] **Step 2: Add notes constants and helpers**

After `const ACTIONS_ASSET_ROOT = ...` line, add:

```js
const NOTES_ROOT = path.join(ROOT_DIR, "notes");

const MAX_TITLE_LEN = 200;
const MAX_BODY_BYTES = 1024 * 1024;
const MAX_TAGS = 20;
const MAX_TAG_LEN = 40;
const NOTE_ID_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;
const TAG_RE = /^[a-zA-Z0-9 _-]{1,40}$/;

const sanitizeNoteId = (rawId) =>
  String(rawId ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const slugifyTitle = (title) =>
  String(title ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "note";

const generateNoteId = (title) =>
  `${slugifyTitle(title)}-${crypto.randomBytes(2).toString("hex")}`;

const noteFilePath = (id) => path.join(NOTES_ROOT, `${id}.md`);

const ensureNotesDirectoryExists = async () => {
  await fs.mkdir(NOTES_ROOT, { recursive: true });
};

const validateTags = (rawTags) => {
  if (rawTags === undefined) return [];
  if (!Array.isArray(rawTags)) {
    throw new Error("tags must be an array of strings.");
  }
  if (rawTags.length > MAX_TAGS) {
    throw new Error(`tags array exceeds limit of ${MAX_TAGS}.`);
  }
  return rawTags.map((tag) => {
    const trimmed = String(tag ?? "").trim();
    if (!TAG_RE.test(trimmed)) {
      throw new Error(`Invalid tag: ${trimmed}`);
    }
    return trimmed;
  });
};

const readNoteFile = async (id) => {
  const filePath = noteFilePath(id);
  const resolved = path.resolve(filePath);
  if (!isPathInside(NOTES_ROOT, resolved)) {
    throw new Error("Note path escapes notes directory.");
  }
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data ?? {};
  return {
    id: String(data.id ?? id),
    title: String(data.title ?? "Untitled"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    created: String(data.created ?? new Date().toISOString()),
    updated: String(data.updated ?? new Date().toISOString()),
    body: parsed.content ?? "",
  };
};

const writeNoteFile = async (note) => {
  const front = {
    id: note.id,
    title: note.title,
    tags: note.tags,
    created: note.created,
    updated: note.updated,
  };
  const serialized = matter.stringify(note.body ?? "", front);
  const filePath = noteFilePath(note.id);
  const tempPath = `${filePath}.${Date.now()}.${Math.random()
    .toString(16)
    .slice(2)}.tmp`;
  await fs.writeFile(tempPath, serialized, "utf8");
  await fs.rename(tempPath, filePath);
};
```

- [ ] **Step 3: Call ensureNotesDirectoryExists at startup**

Find the line `await ensureManifestExists();` near the bottom and add the notes directory ensure call right after it:

```js
await ensureManifestExists();
await ensureNotesDirectoryExists();
```

- [ ] **Step 4: Run server, verify no startup errors**

Run:
```bash
npm run asset-manager-api
```

Expected: console prints `[asset-manager-api] listening on http://localhost:5180`. `notes/` directory exists. Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add scripts/asset-manager-server.mjs
git commit -m "feat(journal): Add backend helpers for notes I/O"
```

---

## Task 4: Backend — list, get, create endpoints

**Files:**
- Modify: `scripts/asset-manager-server.mjs`

- [ ] **Step 1: Add three endpoints**

Below the existing `app.post("/api/asset-manager/abilities", ...)` block and BEFORE the `app.use((error, ...))` error handler, add:

```js
app.get("/api/journal/notes", async (request, response, next) => {
  try {
    const entries = await fs.readdir(NOTES_ROOT, { withFileTypes: true });
    const summaries = [];
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      const id = entry.name.slice(0, -3);
      try {
        const note = await readNoteFile(id);
        summaries.push({
          id: note.id,
          title: note.title,
          tags: note.tags,
          created: note.created,
          updated: note.updated,
        });
      } catch {
        // Skip unreadable / malformed files silently.
      }
    }
    summaries.sort((a, b) => b.updated.localeCompare(a.updated));
    response.json({ notes: summaries });
  } catch (error) {
    next(error);
  }
});

app.get("/api/journal/notes/:id", async (request, response, next) => {
  try {
    const id = sanitizeNoteId(request.params.id);
    if (!id || !NOTE_ID_RE.test(id)) {
      response.status(400).json({ message: "Invalid note id." });
      return;
    }
    try {
      const note = await readNoteFile(id);
      response.json(note);
    } catch (error) {
      if (error.code === "ENOENT") {
        response.status(404).json({ message: "Note not found." });
        return;
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

app.post("/api/journal/notes", async (request, response, next) => {
  try {
    const rawTitle = String(request.body?.title ?? "").trim();
    if (!rawTitle) {
      response.status(400).json({ message: "title is required." });
      return;
    }
    if (rawTitle.length > MAX_TITLE_LEN) {
      response.status(400).json({ message: "title too long." });
      return;
    }
    const body = String(request.body?.body ?? "");
    if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
      response.status(400).json({ message: "body too large." });
      return;
    }
    const tags = validateTags(request.body?.tags);

    let id = generateNoteId(rawTitle);
    while (true) {
      try {
        await fs.access(noteFilePath(id));
        id = generateNoteId(rawTitle);
      } catch {
        break;
      }
    }
    const now = new Date().toISOString();
    const note = {
      id,
      title: rawTitle,
      tags,
      created: now,
      updated: now,
      body,
    };
    await writeNoteFile(note);
    response.status(201).json(note);
  } catch (error) {
    next(error);
  }
});
```

- [ ] **Step 2: Smoke-test with curl**

Start server:
```bash
npm run asset-manager-api
```

In a second shell:
```bash
curl -s -X POST http://localhost:5180/api/journal/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Note","tags":["Lore"],"body":"hello world"}'
```

Expected: JSON note object with `id`, `created`, `updated`, body `"hello world"`. File appears in `notes/`.

```bash
curl -s http://localhost:5180/api/journal/notes
```

Expected: `{ "notes": [ { ... summary ... } ] }`.

```bash
curl -s http://localhost:5180/api/journal/notes/<id-from-above>
```

Expected: full note object. Stop server.

- [ ] **Step 3: Delete test note**

```bash
rm notes/test-note-*.md
```

- [ ] **Step 4: Commit**

```bash
git add scripts/asset-manager-server.mjs
git commit -m "feat(journal): Add list/get/create endpoints"
```

---

## Task 5: Backend — update and delete endpoints

**Files:**
- Modify: `scripts/asset-manager-server.mjs`

- [ ] **Step 1: Add PUT and DELETE**

Below the `POST /api/journal/notes` block, add:

```js
app.put("/api/journal/notes/:id", async (request, response, next) => {
  try {
    const id = sanitizeNoteId(request.params.id);
    if (!id || !NOTE_ID_RE.test(id)) {
      response.status(400).json({ message: "Invalid note id." });
      return;
    }
    let existing;
    try {
      existing = await readNoteFile(id);
    } catch (error) {
      if (error.code === "ENOENT") {
        response.status(404).json({ message: "Note not found." });
        return;
      }
      throw error;
    }
    const updates = request.body ?? {};
    if (updates.title !== undefined) {
      const t = String(updates.title).trim();
      if (!t) {
        response.status(400).json({ message: "title cannot be empty." });
        return;
      }
      if (t.length > MAX_TITLE_LEN) {
        response.status(400).json({ message: "title too long." });
        return;
      }
      existing.title = t;
    }
    if (updates.tags !== undefined) {
      existing.tags = validateTags(updates.tags);
    }
    if (updates.body !== undefined) {
      const b = String(updates.body);
      if (Buffer.byteLength(b, "utf8") > MAX_BODY_BYTES) {
        response.status(400).json({ message: "body too large." });
        return;
      }
      existing.body = b;
    }
    existing.updated = new Date().toISOString();
    await writeNoteFile(existing);
    response.json(existing);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/journal/notes/:id", async (request, response, next) => {
  try {
    const id = sanitizeNoteId(request.params.id);
    if (!id || !NOTE_ID_RE.test(id)) {
      response.status(400).json({ message: "Invalid note id." });
      return;
    }
    const filePath = noteFilePath(id);
    const resolved = path.resolve(filePath);
    if (!isPathInside(NOTES_ROOT, resolved)) {
      response.status(400).json({ message: "Invalid note path." });
      return;
    }
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code === "ENOENT") {
        response.status(404).json({ message: "Note not found." });
        return;
      }
      throw error;
    }
    response.json({ deleted: id });
  } catch (error) {
    next(error);
  }
});
```

- [ ] **Step 2: Smoke-test**

Start server, then:

```bash
curl -s -X POST http://localhost:5180/api/journal/notes \
  -H "Content-Type: application/json" -d '{"title":"E"}'
# capture the id from response, set as $ID

curl -s -X PUT http://localhost:5180/api/journal/notes/$ID \
  -H "Content-Type: application/json" \
  -d '{"body":"updated body","tags":["Quest"]}'
# Expected: returns updated note with new body, new updated timestamp.

curl -s -X DELETE http://localhost:5180/api/journal/notes/$ID
# Expected: { "deleted": "$ID" }. File removed.
```

- [ ] **Step 3: Commit**

```bash
git add scripts/asset-manager-server.mjs
git commit -m "feat(journal): Add update and delete endpoints"
```

---

## Task 6: Frontend — journalApi.js

**Files:**
- Create: `src/v2/data/journalApi.js`

- [ ] **Step 1: Create the file**

```js
const BASE = "/api/journal/notes";

const handle = async (response) => {
  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      // ignore parse failure
    }
    throw new Error(message);
  }
  return response.json();
};

export const listNotes = async () => {
  const data = await handle(await fetch(BASE));
  return Array.isArray(data?.notes) ? data.notes : [];
};

export const getNote = async (id) =>
  handle(await fetch(`${BASE}/${encodeURIComponent(id)}`));

export const createNote = async (payload) =>
  handle(
    await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );

export const updateNote = async (id, payload) =>
  handle(
    await fetch(`${BASE}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );

export const deleteNote = async (id) =>
  handle(
    await fetch(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" }),
  );
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/data/journalApi.js
git commit -m "feat(journal): Add journalApi fetch wrappers"
```

---

## Task 7: Frontend — JournalRenderer.jsx

**Files:**
- Create: `src/v2/components/journal/JournalRenderer.jsx`

- [ ] **Step 1: Create the file**

```jsx
import ReactMarkdown from "react-markdown";

const JournalRenderer = ({ body }) => {
  return (
    <div className="v2-journal-rendered">
      <ReactMarkdown>{body || "_Empty note._"}</ReactMarkdown>
    </div>
  );
};

export default JournalRenderer;
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/components/journal/JournalRenderer.jsx
git commit -m "feat(journal): Add JournalRenderer markdown view"
```

---

## Task 8: Frontend — JournalEditor.jsx

**Files:**
- Create: `src/v2/components/journal/JournalEditor.jsx`

- [ ] **Step 1: Create the file**

```jsx
const JournalEditor = ({ value, onChange }) => {
  return (
    <textarea
      className="v2-journal-editor"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Begin your entry..."
      spellCheck
    />
  );
};

export default JournalEditor;
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/components/journal/JournalEditor.jsx
git commit -m "feat(journal): Add JournalEditor textarea"
```

---

## Task 9: Frontend — JournalTagInput.jsx

**Files:**
- Create: `src/v2/components/journal/JournalTagInput.jsx`

- [ ] **Step 1: Create the file**

```jsx
import { useState } from "react";

const PRESET_TAGS = [
  "Lore",
  "Quest",
  "NPC",
  "Location",
  "Item",
  "Combat",
  "Session",
  "Player",
];

const JournalTagInput = ({ tags, onChange }) => {
  const [draft, setDraft] = useState("");

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
  };

  const removeTag = (tag) => {
    onChange(tags.filter((existing) => existing !== tag));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    addTag(draft);
    setDraft("");
  };

  return (
    <div className="v2-journal-tag-input">
      <div className="v2-journal-tag-row">
        {tags.map((tag) => (
          <span key={tag} className="v2-journal-tag-chip is-active">
            {tag}
            <button
              type="button"
              className="v2-journal-tag-remove"
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
            >
              x
            </button>
          </span>
        ))}
      </div>
      <div className="v2-journal-tag-presets">
        {PRESET_TAGS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`v2-journal-tag-chip ${
              tags.includes(preset) ? "is-disabled" : ""
            }`}
            onClick={() => addTag(preset)}
            disabled={tags.includes(preset)}
          >
            + {preset}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="v2-journal-tag-form">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add custom tag..."
          maxLength={40}
        />
        <button type="submit" disabled={!draft.trim()}>
          Add
        </button>
      </form>
    </div>
  );
};

export default JournalTagInput;
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/components/journal/JournalTagInput.jsx
git commit -m "feat(journal): Add JournalTagInput with preset chips"
```

---

## Task 10: Frontend — JournalNoteList.jsx

**Files:**
- Create: `src/v2/components/journal/JournalNoteList.jsx`

- [ ] **Step 1: Create the file**

```jsx
const formatRelative = (iso) => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diffMs < minute) return "just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d ago`;
  return new Date(iso).toLocaleDateString();
};

const JournalNoteList = ({ notes, selectedId, onSelect }) => {
  if (notes.length === 0) {
    return (
      <p className="v2-journal-empty">
        No entries yet. Press + New to begin.
      </p>
    );
  }

  return (
    <ul className="v2-journal-note-list" role="listbox">
      {notes.map((note) => (
        <li
          key={note.id}
          className={`v2-journal-note-row ${
            note.id === selectedId ? "is-selected" : ""
          }`}
          role="option"
          aria-selected={note.id === selectedId}
          onClick={() => onSelect(note.id)}
        >
          <div className="v2-journal-note-row-title">{note.title}</div>
          <div className="v2-journal-note-row-meta">
            {note.tags[0] ? (
              <span className="v2-journal-tag-chip is-mini">
                {note.tags[0]}
              </span>
            ) : null}
            <span className="v2-journal-note-row-time">
              {formatRelative(note.updated)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default JournalNoteList;
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/components/journal/JournalNoteList.jsx
git commit -m "feat(journal): Add JournalNoteList sidebar rows"
```

---

## Task 11: Frontend — JournalSidebar.jsx

**Files:**
- Create: `src/v2/components/journal/JournalSidebar.jsx`

- [ ] **Step 1: Create the file**

```jsx
import { useMemo } from "react";
import JournalNoteList from "./JournalNoteList";

const SORT_OPTIONS = [
  { value: "updated", label: "Last modified" },
  { value: "created", label: "Date created" },
  { value: "title", label: "Title" },
];

const sortNotes = (notes, sortBy) => {
  const copy = [...notes];
  if (sortBy === "title") {
    copy.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    copy.sort((a, b) => (b[sortBy] || "").localeCompare(a[sortBy] || ""));
  }
  return copy;
};

const JournalSidebar = ({
  notes,
  selectedId,
  sortBy,
  onSortChange,
  tagFilter,
  onTagFilterChange,
  onSelect,
  onCreate,
}) => {
  const allTags = useMemo(() => {
    const set = new Set();
    notes.forEach((note) => note.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [notes]);

  const filtered = useMemo(() => {
    const list = tagFilter
      ? notes.filter((note) => note.tags.includes(tagFilter))
      : notes;
    return sortNotes(list, sortBy);
  }, [notes, sortBy, tagFilter]);

  return (
    <aside className="v2-journal-sidebar">
      <div className="v2-journal-sidebar-header">
        <h2>Journal</h2>
        <button
          type="button"
          className="v2-journal-new-button"
          onClick={onCreate}
        >
          + New
        </button>
      </div>

      <div className="v2-journal-sort">
        <label>
          Sort
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {allTags.length > 0 ? (
        <div className="v2-journal-tag-filter">
          <button
            type="button"
            className={`v2-journal-tag-chip ${
              tagFilter === null ? "is-active" : ""
            }`}
            onClick={() => onTagFilterChange(null)}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`v2-journal-tag-chip ${
                tagFilter === tag ? "is-active" : ""
              }`}
              onClick={() =>
                onTagFilterChange(tagFilter === tag ? null : tag)
              }
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}

      <JournalNoteList
        notes={filtered}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </aside>
  );
};

export default JournalSidebar;
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/components/journal/JournalSidebar.jsx
git commit -m "feat(journal): Add JournalSidebar with sort and tag filter"
```

---

## Task 12: Frontend — JournalNoteView.jsx

**Files:**
- Create: `src/v2/components/journal/JournalNoteView.jsx`

- [ ] **Step 1: Create the file**

```jsx
import JournalEditor from "./JournalEditor";
import JournalRenderer from "./JournalRenderer";
import JournalTagInput from "./JournalTagInput";

const JournalNoteView = ({
  note,
  draftBody,
  onDraftBodyChange,
  editMode,
  onToggleMode,
  onTitleChange,
  onTagsChange,
  onDelete,
  saving,
}) => {
  if (!note) {
    return (
      <div className="v2-journal-empty-pane">
        <p>Select a note from the sidebar, or press + New to start one.</p>
      </div>
    );
  }

  return (
    <article className="v2-journal-note-view">
      <header className="v2-journal-note-header">
        <input
          type="text"
          className="v2-journal-title-input"
          value={note.title}
          maxLength={200}
          onChange={(event) => onTitleChange(event.target.value, false)}
          onBlur={(event) => onTitleChange(event.target.value, true)}
        />
        <div className="v2-journal-note-actions">
          <button
            type="button"
            className={`v2-journal-mode-toggle ${
              editMode ? "is-edit" : "is-preview"
            }`}
            onClick={onToggleMode}
            disabled={saving}
          >
            {editMode ? "Preview" : "Edit"}
          </button>
          <button
            type="button"
            className="v2-journal-delete-button"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </header>

      <JournalTagInput tags={note.tags} onChange={onTagsChange} />

      <div className="v2-journal-body">
        {editMode ? (
          <JournalEditor value={draftBody} onChange={onDraftBodyChange} />
        ) : (
          <JournalRenderer body={note.body} />
        )}
      </div>

      {saving ? <div className="v2-journal-saving">Saving...</div> : null}
    </article>
  );
};

export default JournalNoteView;
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/components/journal/JournalNoteView.jsx
git commit -m "feat(journal): Add JournalNoteView right-pane component"
```

---

## Task 13: Frontend — V2Journal.jsx page

**Files:**
- Create: `src/v2/pages/V2Journal.jsx`

- [ ] **Step 1: Create the file**

```jsx
import { useEffect, useState } from "react";
import JournalSidebar from "../components/journal/JournalSidebar";
import JournalNoteView from "../components/journal/JournalNoteView";
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
} from "../data/journalApi";
import "../styles/v2-journal.scss";

const V2Journal = () => {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [draftBody, setDraftBody] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [sortBy, setSortBy] = useState("updated");
  const [tagFilter, setTagFilter] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const refreshList = async () => {
    try {
      const fresh = await listNotes();
      setNotes(fresh);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const selectNote = async (id) => {
    setSelectedId(id);
    setEditMode(false);
    try {
      const note = await getNote(id);
      setSelectedNote(note);
      setDraftBody(note.body);
    } catch (err) {
      setError(err.message);
    }
  };

  const replaceSummary = (note) => {
    setNotes((current) => {
      const filtered = current.filter((existing) => existing.id !== note.id);
      return [
        {
          id: note.id,
          title: note.title,
          tags: note.tags,
          created: note.created,
          updated: note.updated,
        },
        ...filtered,
      ];
    });
  };

  const handleCreate = async () => {
    try {
      const created = await createNote({ title: "Untitled", body: "", tags: [] });
      replaceSummary(created);
      setSelectedId(created.id);
      setSelectedNote(created);
      setDraftBody(created.body);
      setEditMode(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleMode = async () => {
    if (!selectedNote) return;
    if (editMode) {
      setSaving(true);
      try {
        const updated = await updateNote(selectedNote.id, { body: draftBody });
        setSelectedNote(updated);
        setDraftBody(updated.body);
        replaceSummary(updated);
        setEditMode(false);
      } catch (err) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    } else {
      setEditMode(true);
    }
  };

  const handleTitleChange = async (newTitle, commit) => {
    if (!selectedNote) return;
    setSelectedNote({ ...selectedNote, title: newTitle });
    if (!commit) return;
    if (newTitle.trim() === "" || newTitle === selectedNote.title) return;
    try {
      const updated = await updateNote(selectedNote.id, { title: newTitle });
      setSelectedNote(updated);
      replaceSummary(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTagsChange = async (newTags) => {
    if (!selectedNote) return;
    const previous = selectedNote.tags;
    setSelectedNote({ ...selectedNote, tags: newTags });
    try {
      const updated = await updateNote(selectedNote.id, { tags: newTags });
      setSelectedNote(updated);
      replaceSummary(updated);
    } catch (err) {
      setError(err.message);
      setSelectedNote({ ...selectedNote, tags: previous });
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    if (!window.confirm(`Delete "${selectedNote.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteNote(selectedNote.id);
      setNotes((current) => current.filter((note) => note.id !== selectedNote.id));
      setSelectedId(null);
      setSelectedNote(null);
      setDraftBody("");
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="v2-journal">
      <JournalSidebar
        notes={notes}
        selectedId={selectedId}
        sortBy={sortBy}
        onSortChange={setSortBy}
        tagFilter={tagFilter}
        onTagFilterChange={setTagFilter}
        onSelect={selectNote}
        onCreate={handleCreate}
      />
      <section className="v2-journal-main">
        {error ? (
          <div className="v2-journal-error" onClick={() => setError(null)}>
            {error}
          </div>
        ) : null}
        <JournalNoteView
          note={selectedNote}
          draftBody={draftBody}
          onDraftBodyChange={setDraftBody}
          editMode={editMode}
          onToggleMode={handleToggleMode}
          onTitleChange={handleTitleChange}
          onTagsChange={handleTagsChange}
          onDelete={handleDelete}
          saving={saving}
        />
      </section>
    </div>
  );
};

export default V2Journal;
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/pages/V2Journal.jsx
git commit -m "feat(journal): Add V2Journal page orchestrator"
```

---

## Task 14: Wire route and tab

**Files:**
- Modify: `src/Router.jsx`
- Modify: `src/v2/layout/V2TabBar.jsx`

- [ ] **Step 1: Add Router import and route**

In `src/Router.jsx`, add the import after the other v2 page imports:

```jsx
import V2Journal from "./v2/pages/V2Journal";
```

And add the route inside the v2 layout block, before the `*` catch-all:

```jsx
<Route path="journal" element={<V2Journal />} />
```

The v2 block should now look like:

```jsx
<Route path="/v2" element={<V2Layout />}>
  <Route index element={<Navigate to="overview" replace />} />
  <Route path="overview" element={<V2Overview />} />
  <Route path="background" element={<V2Background />} />
  <Route path="journal" element={<V2Journal />} />
  <Route path="assets" element={<V2AssetManager />} />
  <Route path="*" element={<V2NotFound />} />
</Route>
```

- [ ] **Step 2: Add tab entry**

In `src/v2/layout/V2TabBar.jsx`, update the `tabs` array:

```js
const tabs = [
  { path: "overview", label: "Overview" },
  { path: "background", label: "Background" },
  { path: "journal", label: "Journal" },
  { path: "assets", label: "Asset Manager" },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/Router.jsx src/v2/layout/V2TabBar.jsx
git commit -m "feat(journal): Wire route and tab bar entry"
```

---

## Task 15: Styling — v2-journal.scss

**Files:**
- Create: `src/v2/styles/v2-journal.scss`

- [ ] **Step 1: Create stylesheet**

```scss
.v2-journal {
  display: flex;
  flex: 1;
  min-height: 0;
  height: 100%;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.v2-journal-sidebar {
  width: 22rem;
  min-width: 18rem;
  max-width: 26rem;
  display: flex;
  flex-direction: column;
  background: rgba(20, 16, 12, 0.85);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 0.5rem;
  padding: 0.75rem;
  gap: 0.6rem;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4);

  .v2-journal-sidebar-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;

    h2 {
      margin: 0;
      font-family: "Cinzel", "Trajan Pro", serif;
      color: #d4af37;
      letter-spacing: 0.08em;
      font-size: 1.15rem;
    }
  }

  .v2-journal-new-button {
    background: linear-gradient(180deg, #6e2828, #3a1212);
    color: #f4e9c1;
    border: 1px solid #d4af37;
    border-radius: 0.25rem;
    padding: 0.3rem 0.7rem;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      background: linear-gradient(180deg, #8a3232, #4a1818);
    }
  }

  .v2-journal-sort {
    label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #c9b27a;
      font-size: 0.85rem;
    }

    select {
      flex: 1;
      background: #1a140d;
      color: #f4e9c1;
      border: 1px solid rgba(212, 175, 55, 0.4);
      padding: 0.25rem 0.4rem;
      border-radius: 0.2rem;
    }
  }

  .v2-journal-tag-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }
}

.v2-journal-tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(60, 45, 30, 0.7);
  color: #e8d8a4;
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover:not(:disabled) {
    background: rgba(90, 70, 40, 0.85);
    border-color: #d4af37;
  }

  &.is-active {
    background: linear-gradient(180deg, #d4af37, #8a6f1c);
    color: #1a140d;
    border-color: #f4e9c1;
  }

  &.is-mini {
    font-size: 0.7rem;
    padding: 0.05rem 0.45rem;
  }

  &.is-disabled,
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.v2-journal-tag-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-weight: 700;
  padding: 0;
}

.v2-journal-empty,
.v2-journal-empty-pane {
  color: #a89870;
  font-style: italic;
  text-align: center;
  padding: 2rem 1rem;
}

.v2-journal-note-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
}

.v2-journal-note-row {
  padding: 0.55rem 0.6rem;
  border-radius: 0.3rem;
  cursor: pointer;
  border: 1px solid transparent;
  margin-bottom: 0.3rem;

  &:hover {
    background: rgba(80, 60, 30, 0.4);
  }

  &.is-selected {
    background: rgba(120, 90, 35, 0.55);
    border-color: rgba(212, 175, 55, 0.7);
  }

  .v2-journal-note-row-title {
    color: #f4e9c1;
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 0.2rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .v2-journal-note-row-meta {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    color: #b59c66;
  }
}

.v2-journal-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.v2-journal-error {
  background: #6e2828;
  color: #f4e9c1;
  padding: 0.5rem 0.8rem;
  border-radius: 0.3rem;
  border: 1px solid #d4af37;
  cursor: pointer;
}

.v2-journal-note-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: rgba(20, 16, 12, 0.85);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 0.5rem;
  overflow: hidden;
}

.v2-journal-note-header {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  padding: 0.65rem 0.85rem;
  background: rgba(40, 30, 20, 0.85);
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
}

.v2-journal-title-input {
  flex: 1;
  background: transparent;
  border: 1px solid transparent;
  color: #f4e9c1;
  font-family: "Cinzel", "Trajan Pro", serif;
  font-size: 1.2rem;
  letter-spacing: 0.04em;
  padding: 0.25rem 0.4rem;
  border-radius: 0.25rem;

  &:focus {
    outline: none;
    border-color: rgba(212, 175, 55, 0.6);
    background: rgba(0, 0, 0, 0.25);
  }
}

.v2-journal-note-actions {
  display: flex;
  gap: 0.5rem;
}

.v2-journal-mode-toggle,
.v2-journal-delete-button {
  border: 1px solid #d4af37;
  border-radius: 0.25rem;
  padding: 0.3rem 0.85rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.04em;
}

.v2-journal-mode-toggle.is-edit {
  background: linear-gradient(180deg, #6e2828, #3a1212);
  color: #f4e9c1;
}

.v2-journal-mode-toggle.is-preview {
  background: linear-gradient(180deg, #d4af37, #8a6f1c);
  color: #1a140d;
}

.v2-journal-delete-button {
  background: transparent;
  color: #d49797;
  border-color: #6e2828;

  &:hover {
    background: #6e2828;
    color: #f4e9c1;
  }
}

.v2-journal-tag-input {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.55rem 0.85rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  background: rgba(30, 22, 15, 0.7);

  .v2-journal-tag-row,
  .v2-journal-tag-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .v2-journal-tag-form {
    display: flex;
    gap: 0.4rem;

    input {
      flex: 1;
      background: #1a140d;
      color: #f4e9c1;
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 0.2rem;
      padding: 0.25rem 0.5rem;
    }

    button {
      background: rgba(212, 175, 55, 0.2);
      color: #f4e9c1;
      border: 1px solid rgba(212, 175, 55, 0.4);
      border-radius: 0.2rem;
      padding: 0.25rem 0.7rem;
      cursor: pointer;

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
  }
}

.v2-journal-body {
  flex: 1;
  min-height: 0;
  display: flex;
  padding: 1.25rem;
  background:
    radial-gradient(circle at top left, rgba(255, 240, 200, 0.06), transparent 60%),
    linear-gradient(180deg, #f4ead2 0%, #ecdfba 100%);
  color: #2a1c10;
  overflow: auto;
}

.v2-journal-editor {
  flex: 1;
  width: 100%;
  min-height: 22rem;
  resize: none;
  border: none;
  background: transparent;
  color: #2a1c10;
  font-family: "EB Garamond", "Crimson Text", Georgia, "Times New Roman", serif;
  font-size: 1.05rem;
  line-height: 1.55;
  outline: none;
}

.v2-journal-rendered {
  flex: 1;
  font-family: "EB Garamond", "Crimson Text", Georgia, "Times New Roman", serif;
  font-size: 1.05rem;
  line-height: 1.55;

  h1, h2, h3, h4 {
    font-family: "Cinzel", "Trajan Pro", serif;
    color: #5a3a14;
    border-bottom: 1px solid rgba(212, 175, 55, 0.55);
    padding-bottom: 0.15rem;
    margin-top: 1.2rem;
  }

  blockquote {
    border-left: 3px solid #8a6f1c;
    margin: 0.75rem 0;
    padding: 0.25rem 0.85rem;
    color: #5a3a14;
    font-style: italic;
    background: rgba(212, 175, 55, 0.08);
  }

  code {
    background: rgba(58, 18, 18, 0.08);
    padding: 0 0.25rem;
    border-radius: 0.2rem;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 0.92em;
  }

  pre {
    background: rgba(20, 16, 12, 0.92);
    color: #f4e9c1;
    padding: 0.75rem 1rem;
    border-radius: 0.3rem;
    overflow-x: auto;

    code {
      background: transparent;
      color: inherit;
    }
  }

  a {
    color: #6e2828;
    text-decoration: underline;
  }

  ul, ol {
    padding-left: 1.5rem;
  }
}

.v2-journal-saving {
  align-self: flex-end;
  font-size: 0.75rem;
  color: #c9b27a;
  padding: 0 0.85rem 0.4rem;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/styles/v2-journal.scss
git commit -m "feat(journal): Add journal styling with parchment body"
```

---

## Task 16: Manual end-to-end verification

No code changes. This is the soak test.

- [ ] **Step 1: Run dev:assets**

```bash
npm run dev:assets
```

Expected: both Vite (5173) and asset-manager-api (5180) start without errors.

- [ ] **Step 2: Navigate to Journal tab**

Open `http://localhost:5173/v2/journal`. Expected: dark sidebar on left with `Journal` heading + `+ New` button + Sort dropdown; right pane shows "Select a note... or press + New".

- [ ] **Step 3: Create a note**

Click `+ New`. Expected: a note named `Untitled` appears in the sidebar and is selected. Right pane shows title input, tag input, Edit/Preview toggle, Delete. Mode is Edit.

- [ ] **Step 4: Type body, switch title, add tags**

- Type a few markdown lines: `# Heading`, `**bold**`, `- list item`.
- Change the title to `Tavern Rumors` (blur to save).
- Click preset chip `Lore`, then type `waterdeep` + Add.

Expected: the file `notes/untitled-XXXX.md` (or similar) exists; opening it shows frontmatter with `title: Tavern Rumors`, `tags: [Lore, waterdeep]`, and the markdown body.

- [ ] **Step 5: Toggle Preview**

Click `Preview`. Expected: the textarea is replaced with rendered markdown on parchment background — heading shows brown serif with gold underline, bold appears bold.

- [ ] **Step 6: Sort and filter**

- Click `+ New` again, give it a different title and a `Quest` tag.
- In the sidebar, click the `Quest` filter chip — the list filters down to just that note.
- Click `All` to clear.
- Switch the Sort dropdown to `Title` — order changes alphabetically.

- [ ] **Step 7: Delete**

Select a note, click `Delete`, confirm. Expected: the note disappears from the sidebar and `notes/<id>.md` is gone.

- [ ] **Step 8: Persistence**

Stop `dev:assets` (Ctrl+C). Run `npm run dev:assets` again. Open `/v2/journal`. Expected: remaining notes still appear.

- [ ] **Step 9: Final commit**

If anything was tweaked during verification, commit it. Otherwise no commit.

---

## Self-review notes

- All 5 backend endpoints from the spec are covered (Tasks 4 and 5).
- All 7 components from the spec file layout are covered (Tasks 7-13).
- All identifiers are consistent: `replaceSummary`, `selectNote`, `handleCreate`, `handleToggleMode` are used as defined.
- Styling, routing, dependency installation each have explicit tasks.
- No placeholders or "implement later" markers remain.
