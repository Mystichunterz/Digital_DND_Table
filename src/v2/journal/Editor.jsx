import ReactMarkdown from "react-markdown";

const Editor = ({ body, onChange, viewMode }) => {
  const showEditor = viewMode !== "preview";
  const showPreview = viewMode !== "edit";
  return (
    <div className={`v2-journal-editor-split is-${viewMode}`}>
      {showEditor ? (
        <textarea
          className="v2-journal-editor"
          value={body}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Begin your entry..."
          spellCheck
        />
      ) : null}
      {showPreview ? (
        <div className="v2-journal-rendered">
          <ReactMarkdown>{body || "_Empty note._"}</ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
};

export default Editor;
