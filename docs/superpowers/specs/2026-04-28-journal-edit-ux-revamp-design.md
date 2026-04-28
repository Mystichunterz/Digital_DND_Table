# Journal Edit UX Revamp — Design

Fix the rename and edit experience in the v2 journal. The current implementation has a real bug (title saves never fire) and several UX rough edges (silent body loss when switching notes, save-only-on-Preview, laggy keystrokes from per-key parent re-renders, melded sidebar rows, ambiguous title affordance). This pass keeps the existing layout, components, and Edit↔Preview toggle but reworks how state flows and how the sidebar looks.

## Goals

- Title rename actually persists.
- No silent loss of body edits when switching notes or closing the tab.
- Editing the body and the title is debounced auto-save — Preview button just toggles view, never saves.
- Typing in the body or title doesn't visibly lag.
- Sidebar note rows are visually distinct cards rather than a melded blob.
- Title input clearly looks editable.

## Non-goals

- Live side-by-side preview (Edit↔Preview toggle stays).
- Multi-tab conflict handling (single-user assumption).
- Custom undo/redo (browser-native undo in the textarea is enough).
- Backend changes — the existing PUT endpoint already supports partial updates.

## Root cause: the lag and the rename bug

Both issues come from the same shape — `V2Journal` owns *every* piece of edit state, and the editor + title input are fully controlled inputs that call back up to it on each keystroke. Every key triggers a re-render of the whole journal tree (sidebar list, tag filter, note view, both useMemos), which is what makes typing feel sluggish. The rename bug is a side effect of the same architecture: the optimistic state update fires before the equality check in `handleTitleChange`, so `newTitle === selectedNote.title` is always true on blur and the PUT is skipped.

The fix is to push edit state into the input components themselves, surface only "save this when you're idle" callbacks to the parent, and keep the parent's state to "the last known saved version of the note."

## Architecture change

Introduce a small reusable hook, `useDebouncedSave`, that owns a draft value and fires a save callback after a quiet period. Each input component (`JournalEditor`, the title `<input>`, `JournalTagInput`) wires through this hook so:

- Local state updates instantly on each keystroke (no parent re-render → no lag).
- After ~600 ms of idle, the save callback runs, which calls `updateNote` on the backend.
- A status flag (`idle | dirty | saving | saved`) is exposed and the page shows a small indicator near the mode toggle.
- On unmount (the editor goes away because the user switched notes or navigated) the hook flushes any pending save synchronously.
- `window.beforeunload` flushes pending saves too.

`V2Journal` keeps `selectedNote` as the *server-known* version and updates it from the save response, so future selections never lose data. There is no more separate `draftBody` in the parent — the editor owns its own draft.

## Components to touch

### `src/v2/components/journal/useDebouncedSave.js` (new)

A hook taking `(initialValue, saveFn, debounceMs = 600)`. Returns:

```ts
{
  value,
  setValue,        // setter for keystrokes
  status,          // "idle" | "dirty" | "saving" | "saved"
  flush,           // imperative; await pending save and run it now
  reset,           // imperative; replace value without dirtying
}
```

Internals: keep a ref to the latest value, a timer ref, a "last-saved" ref. On `setValue`, update local state, mark dirty, restart timer. When timer fires, save and update last-saved. `flush` clears the timer and runs the save synchronously (returns the promise). `reset` updates last-saved as well so it doesn't trigger a save.

### `JournalEditor.jsx`

Becomes self-contained: receives `noteId`, `initialBody`, and `onSaved(updatedNote)`. Wires `useDebouncedSave` to call `updateNote(noteId, { body })`. Exposes status to its parent via `onStatusChange` so the toolbar can show "Saving…" / "Saved".

### Title input (lives in `JournalNoteView`)

Same treatment via `useDebouncedSave`. Trim before saving. Skip save if the trimmed value equals the last-saved value or is empty.

### `JournalTagInput.jsx`

Stays mostly the same — tags are atomic add/remove operations and don't suffer from the keystroke lag. Keep the existing PUT-on-change behaviour, but surface saving status so the same indicator covers all three.

### `JournalNoteView.jsx`

- Remove the `draftBody` prop and the `onTitleChange(value, commit)` two-arg pattern.
- Owns the title input via `useDebouncedSave`.
- Renders the editor (with `key={note.id}`) so switching notes flushes the previous editor's pending save (its unmount runs the flush).
- Hosts a single status pill ("Saved 2s ago" / "Saving…").

### `V2Journal.jsx`

- Drop `draftBody`, `editMode` toggle stays, `handleTitleChange`, `handleToggleMode` simplify drastically.
- After every save callback (from any field), update the in-memory `selectedNote` and `notes` summary list with the server response.
- `beforeunload` listener flushes pending saves on the active note.

### Sidebar visual fix (`v2-journal.scss`)

Current `.v2-journal-note-row` has only `margin-bottom: 0.3rem` and a transparent border, so rows visually melt together. Change to:

- Solid card background `rgba(40, 30, 20, 0.6)` (slightly lighter than the sidebar surface).
- 1 px border `rgba(212, 175, 55, 0.18)` always visible (a faint gold edge).
- 0.5 rem padding, 0.4 rem gap between rows, 0.35 rem border-radius.
- Hover: bg shifts to `rgba(80, 60, 30, 0.55)`, border to `rgba(212, 175, 55, 0.5)`, subtle 1 px translate-y.
- Selected: keep the existing `is-selected` (heavier bg + brighter border).
- Title row uses bolder weight + slightly larger gap before meta row.
- Tag chip on the row gets clearer separation from "5m ago" timestamp.

### Title affordance

In `v2-journal-title-input`:
- Add a thin dotted gold border-bottom (`1px dotted rgba(212, 175, 55, 0.4)`) at rest.
- On hover, become solid + brighter.
- Add a `✎` pencil glyph to the left as a `::before`.

## Status indicator

Single small element next to the Edit/Preview toggle:

- `idle` → no indicator
- `dirty` → small dot, no text
- `saving` → "Saving…"
- `saved` → "Saved" for ~1.5 s, then fades to idle

The indicator reflects the worst-case status across title, tags, and body — i.e. if any field is `saving`, show "Saving…".

## Verification (manual)

1. Type a title quickly — input keeps up, no perceptible lag.
2. Wait ~700 ms after typing stops — "Saved" appears, file on disk has the new title.
3. Type body, immediately click another note — when reselected, the previous note's body has the typed content.
4. Type body, refresh the tab — the typed content is on disk.
5. Sidebar rows look like distinct cards, hover state visibly lifts.
6. Title input shows pencil + dotted underline at rest.
