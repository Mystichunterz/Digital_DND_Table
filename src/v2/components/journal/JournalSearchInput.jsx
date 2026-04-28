const JournalSearchInput = ({ value, onChange }) => {
  return (
    <div className="v2-journal-search">
      <input
        type="search"
        className="v2-journal-search-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search journal..."
        aria-label="Search journal entries"
      />
      {value ? (
        <button
          type="button"
          className="v2-journal-search-clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          x
        </button>
      ) : null}
    </div>
  );
};

export default JournalSearchInput;
