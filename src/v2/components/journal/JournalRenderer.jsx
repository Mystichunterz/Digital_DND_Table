import ReactMarkdown from "react-markdown";

const JournalRenderer = ({ body }) => {
  return (
    <div className="v2-journal-rendered">
      <ReactMarkdown>{body || "_Empty note._"}</ReactMarkdown>
    </div>
  );
};

export default JournalRenderer;
