import { useMemo } from "react";
import JournalNoteList from "./JournalNoteList";
import JournalSearchInput from "./JournalSearchInput";

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

const matchesSearch = (note, query) => {
  if (!query) return true;
  const haystack = [
    note.title || "",
    (note.tags || []).join(" "),
    note.body || "",
  ]
    .join("\n")
    .toLowerCase();
  return haystack.includes(query);
};

const JournalSidebar = ({
  notes,
  selectedId,
  sortBy,
  onSortChange,
  tagFilter,
  onTagFilterChange,
  searchQuery,
  onSearchChange,
  onSelect,
  onCreate,
}) => {
  const allTags = useMemo(() => {
    const set = new Set();
    notes.forEach((note) => note.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [notes]);

  const normalizedQuery = (searchQuery || "").trim().toLowerCase();

  const filtered = useMemo(() => {
    let list = notes;
    if (tagFilter) {
      list = list.filter((note) => note.tags.includes(tagFilter));
    }
    if (normalizedQuery) {
      list = list.filter((note) => matchesSearch(note, normalizedQuery));
    }
    return sortNotes(list, sortBy);
  }, [notes, sortBy, tagFilter, normalizedQuery]);

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

      <JournalSearchInput value={searchQuery} onChange={onSearchChange} />

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

      {filtered.length === 0 && normalizedQuery ? (
        <p className="v2-journal-empty">No entries match your search.</p>
      ) : (
        <JournalNoteList
          notes={filtered}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      )}
    </aside>
  );
};

export default JournalSidebar;
