import { useMemo, useState } from "react";

const SORT_OPTIONS = [
  { value: "updated", label: "Last modified" },
  { value: "created", label: "Date created" },
  { value: "title", label: "Title" },
];

const formatRelative = (iso) => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
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

const matchesSearch = (note, query) => {
  if (!query) return true;
  const haystack = `${note.title}\n${note.tags.join(" ")}\n${note.body}`
    .toLowerCase();
  return haystack.includes(query);
};

const sortNotes = (notes, sortBy) => {
  const copy = [...notes];
  if (sortBy === "title") {
    copy.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    copy.sort((a, b) => (b[sortBy] || "").localeCompare(a[sortBy] || ""));
  }
  return copy;
};

const Sidebar = ({ notes, selectedId, onSelect, onCreate, loading }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [tagFilter, setTagFilter] = useState(null);

  const allTags = useMemo(() => {
    const set = new Set();
    for (const note of notes) {
      for (const tag of note.tags) set.add(tag);
    }
    return Array.from(set).sort();
  }, [notes]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const visible = useMemo(() => {
    let list = notes;
    if (tagFilter) list = list.filter((n) => n.tags.includes(tagFilter));
    if (normalizedQuery) {
      list = list.filter((n) => matchesSearch(n, normalizedQuery));
    }
    return sortNotes(list, sortBy);
  }, [notes, tagFilter, normalizedQuery, sortBy]);

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

      <div className="v2-journal-search">
        <input
          type="search"
          className="v2-journal-search-input"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search journal..."
          aria-label="Search journal entries"
        />
        {searchQuery ? (
          <button
            type="button"
            className="v2-journal-search-clear"
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
          >
            ×
          </button>
        ) : null}
      </div>

      <div className="v2-journal-sort">
        <label>
          Sort
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
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
            onClick={() => setTagFilter(null)}
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
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}

      {loading && notes.length === 0 ? (
        <div
          className="v2-journal-loading"
          role="status"
          aria-live="polite"
        >
          <span className="v2-journal-spinner" aria-hidden="true" />
          <span className="v2-journal-loading-label">Loading entries…</span>
        </div>
      ) : visible.length === 0 ? (
        <p className="v2-journal-empty">
          {normalizedQuery || tagFilter
            ? "No entries match."
            : "No entries yet. Press + New to begin."}
        </p>
      ) : (
        <ul className="v2-journal-note-list" role="listbox">
          {visible.map((note) => (
            <li
              key={note.id}
              role="option"
              aria-selected={note.id === selectedId}
              className={`v2-journal-note-row ${
                note.id === selectedId ? "is-selected" : ""
              }`}
              onClick={() => onSelect(note.id)}
            >
              <div className="v2-journal-note-row-title">
                {note.title || "Untitled"}
              </div>
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
      )}
    </aside>
  );
};

export default Sidebar;
