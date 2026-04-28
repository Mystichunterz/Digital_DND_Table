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
