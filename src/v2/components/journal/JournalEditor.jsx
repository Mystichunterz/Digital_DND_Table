const JournalEditor = ({ value, onChange }) => {
  return (
    <textarea
      className="v2-journal-editor"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Begin your entry..."
      spellCheck
    />
  );
};

export default JournalEditor;
