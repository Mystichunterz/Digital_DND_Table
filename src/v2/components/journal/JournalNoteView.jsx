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
