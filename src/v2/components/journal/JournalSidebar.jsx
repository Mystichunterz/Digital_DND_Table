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
