# Journal Edit UX Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the journal's edit UX — eliminate the title-rename save bug, prevent silent body loss when switching notes, kill per-keystroke lag, give sidebar rows visual separation, and make the title input clearly editable.

**Architecture:** Introduce a `useDebouncedSave` hook so the title input and `JournalEditor` own their draft state locally and auto-save on a 600 ms debounce. Each input flushes any pending save on unmount, so switching notes never loses edits. `V2Journal` no longer holds `draftBody`. SCSS updates give note rows a card look and the title input a pencil + dotted underline at rest.

**Tech Stack:** React 18 (useState, useEffect, useRef, useCallback), SCSS via sass-embedded.

**Note on tests:** The project has no test infrastructure; verification is manual.

---

## File Structure

**New files:**
- `src/v2/components/journal/useDebouncedSave.js` — debounced auto-save hook (one clear responsibility: own a draft, flush on unmount, expose status).

**Modified files:**
- `src/v2/components/journal/JournalEditor.jsx` — now self-contained; takes `noteId`, `initialBody`, `onSaved`, `onStatusChange`.
- `src/v2/components/journal/JournalNoteView.jsx` — owns the title input via the hook, hosts the status pill, renders editor with `key={note.id}`.
- `src/v2/pages/V2Journal.jsx` — drop `draftBody` and the `handleTitleChange(value, commit)` two-arg pattern; `handleToggleMode` becomes a pure mode flip; `onSaved` callbacks update the cached note + sidebar summary.
- `src/v2/styles/v2-journal.scss` — sidebar row card styling + title input affordance.

---

## Task 1: useDebouncedSave hook

**Files:**
- Create: `src/v2/components/journal/useDebouncedSave.js`

- [ ] **Step 1: Create the hook**

```js
import { useCallback, useEffect, useRef, useState } from "react";

const FADE_MS = 1500;

export const useDebouncedSave = (initialValue, save, debounceMs = 600) => {
  const [value, setLocalValue] = useState(initialValue);
  const [status, setStatus] = useState("idle");
  const valueRef = useRef(initialValue);
  const lastSavedRef = useRef(initialValue);
  const timerRef = useRef(null);
  const fadeRef = useRef(null);
  const saveRef = useRef(save);
  const mountedRef = useRef(true);

  saveRef.current = save;

  const safeSetStatus = useCallback((next) => {
    if (mountedRef.current) setStatus(next);
  }, []);

  const performSave = useCallback(async () => {
    const next = valueRef.current;
    if (next === lastSavedRef.current) return;
    safeSetStatus("saving");
    try {
      await saveRef.current(next);
      lastSavedRef.current = next;
      safeSetStatus("saved");
      if (fadeRef.current) clearTimeout(fadeRef.current);
      fadeRef.current = setTimeout(() => {
        fadeRef.current = null;
        safeSetStatus("idle");
      }, FADE_MS);
    } catch {
      safeSetStatus("dirty");
    }
  }, [safeSetStatus]);

  const setValue = useCallback(
    (next) => {
      valueRef.current = next;
      setLocalValue(next);
      if (next === lastSavedRef.current) {
        safeSetStatus("idle");
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
      safeSetStatus("dirty");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        performSave();
      }, debounceMs);
    },
    [debounceMs, performSave, safeSetStatus],
  );

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await performSave();
  }, [performSave]);

  const reset = useCallback((next) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    valueRef.current = next;
    lastSavedRef.current = next;
    setLocalValue(next);
    safeSetStatus("idle");
  }, [safeSetStatus]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (fadeRef.current) {
        clearTimeout(fadeRef.current);
        fadeRef.current = null;
      }
      if (valueRef.current !== lastSavedRef.current) {
        saveRef.current(valueRef.current).catch(() => {});
      }
    };
  }, []);

  return { value, setValue, status, flush, reset };
};
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/components/journal/useDebouncedSave.js
git commit -m "feat(journal): Add useDebouncedSave hook"
```

---

## Task 2: Refactor JournalEditor

**Files:**
- Modify: `src/v2/components/journal/JournalEditor.jsx`

- [ ] **Step 1: Replace file contents**

```jsx
import { useEffect } from "react";
import { useDebouncedSave } from "./useDebouncedSave";
import { updateNote } from "../../data/journalApi";

const JournalEditor = ({ noteId, initialBody, onSaved, onStatusChange }) => {
  const { value, setValue, status } = useDebouncedSave(
    initialBody,
    async (next) => {
      const updated = await updateNote(noteId, { body: next });
      if (onSaved) onSaved(updated);
    },
  );

  useEffect(() => {
    if (onStatusChange) onStatusChange(status);
  }, [status, onStatusChange]);

  return (
    <textarea
      className="v2-journal-editor"
      value={value}
      onChange={(event) => setValue(event.target.value)}
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
git commit -m "refactor(journal): Self-contained editor with debounced save"
```

---

## Task 3: Refactor JournalNoteView

**Files:**
- Modify: `src/v2/components/journal/JournalNoteView.jsx`

- [ ] **Step 1: Replace file contents**

```jsx
import { useCallback, useEffect, useState } from "react";
import JournalEditor from "./JournalEditor";
import JournalRenderer from "./JournalRenderer";
import JournalTagInput from "./JournalTagInput";
import { useDebouncedSave } from "./useDebouncedSave";
import { updateNote } from "../../data/journalApi";

const STATUS_LABEL = {
  saving: "Saving...",
  saved: "Saved",
};

const worstStatus = (a, b) => {
  if (a === "saving" || b === "saving") return "saving";
  if (a === "saved" || b === "saved") return "saved";
  if (a === "dirty" || b === "dirty") return "dirty";
  return "idle";
};

const JournalNoteView = ({
  note,
  onSaved,
  onTagsChange,
  onDelete,
  editMode,
  onToggleMode,
}) => {
  const [editorStatus, setEditorStatus] = useState("idle");

  const titleSave = useCallback(
    async (next) => {
      const trimmed = next.trim();
      if (!note || !trimmed) return;
      const updated = await updateNote(note.id, { title: trimmed });
      if (onSaved) onSaved(updated);
    },
    [note, onSaved],
  );

  const {
    value: titleDraft,
    setValue: setTitleDraft,
    status: titleStatus,
    reset: resetTitleDraft,
  } = useDebouncedSave(note ? note.title : "", titleSave);

  useEffect(() => {
    if (note) resetTitleDraft(note.title);
  }, [note?.id]);

  if (!note) {
    return (
      <div className="v2-journal-empty-pane">
        <p>Select a note from the sidebar, or press + New to start one.</p>
      </div>
    );
  }

  const combinedStatus = worstStatus(editorStatus, titleStatus);
  const statusLabel = STATUS_LABEL[combinedStatus] || "";

  return (
    <article className="v2-journal-note-view">
      <header className="v2-journal-note-header">
        <input
          type="text"
          className="v2-journal-title-input"
          value={titleDraft}
          maxLength={200}
          onChange={(event) => setTitleDraft(event.target.value)}
        />
        <div className="v2-journal-note-actions">
          <span
            className={`v2-journal-status v2-journal-status-${combinedStatus}`}
            aria-live="polite"
          >
            {statusLabel}
          </span>
          <button
            type="button"
            className={`v2-journal-mode-toggle ${
              editMode ? "is-edit" : "is-preview"
            }`}
            onClick={onToggleMode}
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
          <JournalEditor
            key={note.id}
            noteId={note.id}
            initialBody={note.body}
            onSaved={onSaved}
            onStatusChange={setEditorStatus}
          />
        ) : (
          <JournalRenderer body={note.body} />
        )}
      </div>
    </article>
  );
};

export default JournalNoteView;
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/components/journal/JournalNoteView.jsx
git commit -m "refactor(journal): Inline title save + status pill"
```

---

## Task 4: Simplify V2Journal

**Files:**
- Modify: `src/v2/pages/V2Journal.jsx`

- [ ] **Step 1: Replace file contents**

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

const summarize = (note) => ({
  id: note.id,
  title: note.title,
  tags: note.tags,
  created: note.created,
  updated: note.updated,
});

const V2Journal = () => {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [sortBy, setSortBy] = useState("updated");
  const [tagFilter, setTagFilter] = useState(null);
  const [error, setError] = useState(null);

  const refreshList = async () => {
    try {
      setNotes(await listNotes());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const replaceSummary = (note) => {
    setNotes((current) => {
      const filtered = current.filter((existing) => existing.id !== note.id);
      return [summarize(note), ...filtered];
    });
  };

  const handleSaved = (updated) => {
    setSelectedNote(updated);
    replaceSummary(updated);
  };

  const selectNote = async (id) => {
    setSelectedId(id);
    setEditMode(false);
    try {
      const note = await getNote(id);
      setSelectedNote(note);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      const created = await createNote({
        title: "Untitled",
        body: "",
        tags: [],
      });
      replaceSummary(created);
      setSelectedId(created.id);
      setSelectedNote(created);
      setEditMode(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleMode = () => {
    setEditMode((current) => !current);
  };

  const handleTagsChange = async (newTags) => {
    if (!selectedNote) return;
    const previous = selectedNote.tags;
    setSelectedNote({ ...selectedNote, tags: newTags });
    try {
      const updated = await updateNote(selectedNote.id, { tags: newTags });
      handleSaved(updated);
    } catch (err) {
      setError(err.message);
      setSelectedNote((current) =>
        current ? { ...current, tags: previous } : current,
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    if (
      !window.confirm(
        `Delete "${selectedNote.title}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await deleteNote(selectedNote.id);
      setNotes((current) =>
        current.filter((note) => note.id !== selectedNote.id),
      );
      setSelectedId(null);
      setSelectedNote(null);
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
          <div
            className="v2-journal-error"
            onClick={() => setError(null)}
          >
            {error}
          </div>
        ) : null}
        <JournalNoteView
          note={selectedNote}
          editMode={editMode}
          onToggleMode={handleToggleMode}
          onSaved={handleSaved}
          onTagsChange={handleTagsChange}
          onDelete={handleDelete}
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
git commit -m "refactor(journal): Drop draftBody and inline title handler"
```

---

## Task 5: Sidebar row card styling

**Files:**
- Modify: `src/v2/styles/v2-journal.scss`

- [ ] **Step 1: Update `.v2-journal-note-row` block**

Find the existing block:

```scss
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
```

Replace it with:

```scss
.v2-journal-note-row {
  padding: 0.55rem 0.7rem;
  border-radius: 0.35rem;
  cursor: pointer;
  border: 1px solid rgba(212, 175, 55, 0.18);
  background: rgba(40, 30, 20, 0.6);
  margin-bottom: 0.45rem;
  box-shadow: inset 0 1px 0 rgba(255, 240, 200, 0.04),
    0 1px 0 rgba(0, 0, 0, 0.4);
  transition: background 0.12s ease, border-color 0.12s ease,
    transform 0.12s ease;

  &:hover {
    background: rgba(80, 60, 30, 0.72);
    border-color: rgba(212, 175, 55, 0.55);
    transform: translateY(-1px);
  }

  &.is-selected {
    background: rgba(120, 90, 35, 0.7);
    border-color: rgba(244, 233, 193, 0.85);
    box-shadow: inset 0 1px 0 rgba(255, 240, 200, 0.1),
      0 0 0 1px rgba(212, 175, 55, 0.35);
  }

  .v2-journal-note-row-title {
    color: #f4e9c1;
    font-weight: 600;
    font-size: 0.97rem;
    margin-bottom: 0.3rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: 0.01em;
  }

  .v2-journal-note-row-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
    font-size: 0.72rem;
    color: #b59c66;
  }

  .v2-journal-note-row-time {
    margin-left: auto;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/styles/v2-journal.scss
git commit -m "style(journal): Card-style sidebar note rows"
```

---

## Task 6: Title affordance and status pill styling

**Files:**
- Modify: `src/v2/styles/v2-journal.scss`

- [ ] **Step 1: Update `.v2-journal-title-input` and add status styles**

Find the existing block:

```scss
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
```

Replace with:

```scss
.v2-journal-title-input {
  flex: 1;
  background: transparent;
  border: 1px solid transparent;
  border-bottom: 1px dotted rgba(212, 175, 55, 0.45);
  color: #f4e9c1;
  font-family: "Cinzel", "Trajan Pro", serif;
  font-size: 1.2rem;
  letter-spacing: 0.04em;
  padding: 0.25rem 0.4rem 0.25rem 1.55rem;
  border-radius: 0.25rem;
  background-image: linear-gradient(transparent, transparent);
  position: relative;

  &::placeholder {
    color: rgba(244, 233, 193, 0.5);
  }
}

.v2-journal-title-input-wrap {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;

  &::before {
    content: "\270E";
    position: absolute;
    left: 0.45rem;
    color: rgba(212, 175, 55, 0.7);
    font-size: 1rem;
    pointer-events: none;
    transition: color 0.15s ease;
  }

  &:hover::before,
  &:focus-within::before {
    color: #f4e9c1;
  }

  .v2-journal-title-input {
    border-bottom-style: dotted;
    border-bottom-color: rgba(212, 175, 55, 0.45);

    &:hover {
      border-bottom-style: solid;
      border-bottom-color: rgba(212, 175, 55, 0.85);
    }

    &:focus {
      outline: none;
      border-color: rgba(212, 175, 55, 0.6);
      border-bottom-style: solid;
      background: rgba(0, 0, 0, 0.25);
    }
  }
}

.v2-journal-status {
  font-size: 0.78rem;
  color: #c9b27a;
  min-width: 4.5rem;
  text-align: right;
  font-style: italic;
  align-self: center;
}

.v2-journal-status-saving {
  color: #f4d479;
}

.v2-journal-status-saved {
  color: #9ec97a;
}

.v2-journal-status-idle,
.v2-journal-status-dirty {
  color: transparent;
}
```

- [ ] **Step 2: Wrap the title input in `JournalNoteView.jsx`**

The `<input className="v2-journal-title-input" ... />` from Task 3 needs to be wrapped in `<div className="v2-journal-title-input-wrap">` for the pencil glyph to render. Modify the header in `src/v2/components/journal/JournalNoteView.jsx` from:

```jsx
        <input
          type="text"
          className="v2-journal-title-input"
          value={titleDraft}
          maxLength={200}
          onChange={(event) => setTitleDraft(event.target.value)}
        />
```

to:

```jsx
        <div className="v2-journal-title-input-wrap">
          <input
            type="text"
            className="v2-journal-title-input"
            value={titleDraft}
            maxLength={200}
            onChange={(event) => setTitleDraft(event.target.value)}
            placeholder="Untitled"
          />
        </div>
```

- [ ] **Step 3: Commit**

```bash
git add src/v2/styles/v2-journal.scss src/v2/components/journal/JournalNoteView.jsx
git commit -m "style(journal): Title pencil affordance and status pill"
```

---

## Task 7: Manual verification

No code changes. Run the journal end-to-end.

- [ ] **Step 1: Start dev:assets**

```bash
npm run dev:assets
```

Expected: Vite on 5173, asset-manager API on 5180.

- [ ] **Step 2: Type a title quickly**

Open `/v2/journal`. Click `+ New`. Type a title rapidly into the title input.

Expected: input keeps up with typing. After ~700 ms idle, "Saved" pill appears in the header. The corresponding `notes/<id>.md` file's `title` frontmatter matches what was typed.

- [ ] **Step 3: Mid-edit note switch**

Click `+ New` to make a second note. Type body content. Without clicking Preview, click the first note in the sidebar. Click back to the second note.

Expected: the body of the second note still shows what was typed; `notes/<id>.md` for it has the body on disk.

- [ ] **Step 4: Sidebar visual**

Look at the sidebar. Each note row should be a distinct card with a faint gold border, slightly lighter background than the sidebar surface. Hover lifts the card and brightens the border. Selected row stays prominent.

- [ ] **Step 5: Title affordance**

The title input should show a pencil ✎ glyph on the left and a dotted gold underline at rest. Hover turns the underline solid.

- [ ] **Step 6: Refresh persistence**

Type more in the body, wait briefly (~1 s), refresh the page. Reopen the note.

Expected: typed content present.

---

## Self-review notes

- All five spec issues are addressed: (1) title-rename bug → Task 3 inline title save with `useDebouncedSave`, no equality short-circuit; (2) silent body loss → Task 1 unmount-flush + Task 2 editor `key={note.id}` remount on switch; (3) save-only-on-Preview → Task 1+2 debounced auto-save; (4) keystroke lag → Task 2+3 push state into local components, parent no longer re-renders per key; (5) sidebar blob → Task 5 card styling; title affordance → Task 6.
- Hook signature is consistent across Task 2 and Task 3 (`{ value, setValue, status, flush, reset }`).
- `onSaved`, `onTagsChange`, `onDelete`, `onToggleMode` props are stable in name across Tasks 3 and 4.
- No "TBD" or "implement later" markers.
