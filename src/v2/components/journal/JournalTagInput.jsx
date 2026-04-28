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
