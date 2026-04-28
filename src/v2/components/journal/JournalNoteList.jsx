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
