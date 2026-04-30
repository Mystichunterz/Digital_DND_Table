import { useState } from "react";
import Editor from "./Editor";

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

const STATUS_LABEL = {
  saving: "Saving...",
  saved: "Saved",
  error: "Save failed - retry",
};

const TitleField = ({ value, onChange }) => (
  <div className="v2-journal-title-input-wrap">
    <input
      type="text"
      className="v2-journal-title-input"
      value={value}
      maxLength={200}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Untitled"
    />
  </div>
);

const TagField = ({ tags, onChange }) => {
  const [draft, setDraft] = useState("");

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
  };

  const removeTag = (tag) => {
    onChange(tags.filter((existing) => existing !== tag));
  };

  const submit = (event) => {
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
              ×
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
      <form onSubmit={submit} className="v2-journal-tag-form">
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

const SaveIndicator = ({ status, error, onRetry }) => {
  const label = STATUS_LABEL[status];
  if (!label) return <span className="v2-journal-status" aria-live="polite" />;
  if (status === "error") {
    return (
      <button
        type="button"
        className={`v2-journal-status v2-journal-status-${status}`}
        onClick={onRetry}
        title={error || "Save failed"}
      >
        {label}
      </button>
    );
  }
  return (
    <span
      className={`v2-journal-status v2-journal-status-${status}`}
      aria-live="polite"
    >
      {label}
    </span>
  );
};

const VIEW_MODES = [
  { value: "edit", label: "Edit" },
  { value: "split", label: "Both" },
  { value: "preview", label: "Preview" },
];

const ViewToggle = ({ value, onChange }) => (
  <div
    className="v2-journal-view-toggle"
    role="group"
    aria-label="Editor view mode"
  >
    {VIEW_MODES.map((mode) => (
      <button
        key={mode.value}
        type="button"
        className={value === mode.value ? "is-active" : ""}
        aria-pressed={value === mode.value}
        onClick={() => onChange(mode.value)}
      >
        {mode.label}
      </button>
    ))}
  </div>
);

const NotePane = ({ note, status, error, actions }) => {
  const [viewMode, setViewMode] = useState("split");

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
        {/* Keyed on note.id so the input remounts cleanly when switching notes,
            preventing the previous note's title from flashing for a frame. */}
        <TitleField
          key={note.id}
          value={note.title}
          onChange={(value) => actions.setField(note.id, "title", value)}
        />
        <div className="v2-journal-note-actions">
          <SaveIndicator
            status={status}
            error={error}
            onRetry={() => actions.retry(note.id)}
          />
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <button
            type="button"
            className="v2-journal-delete-button"
            onClick={() => actions.remove(note.id)}
          >
            Delete
          </button>
        </div>
      </header>

      <TagField
        tags={note.tags}
        onChange={(tags) => actions.setField(note.id, "tags", tags)}
      />

      <div className="v2-journal-body">
        <Editor
          body={note.body}
          onChange={(value) => actions.setField(note.id, "body", value)}
          viewMode={viewMode}
        />
      </div>
    </article>
  );
};

export default NotePane;
