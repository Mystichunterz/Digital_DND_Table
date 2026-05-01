import { backstoryParagraphs } from "../../../data/backgroundData";

const V2BackstoryPanel = () => {
  return (
    <article className="v2-overview-panel v2-background-panel v2-backstory-panel">
      <header className="v2-overview-panel-header">
        <h2>Backstory</h2>
      </header>

      <div className="v2-backstory-scroll">
        {backstoryParagraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
};

export default V2BackstoryPanel;
