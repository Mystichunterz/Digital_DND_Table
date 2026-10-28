import { backstoryParagraphs } from "@/data/character/background";

const BackstoryPanel = () => {
  return (
    <article className="overview-panel background-panel backstory-panel">
      <header className="overview-panel-header">
        <h2>Backstory</h2>
      </header>

      <div className="backstory-scroll">
        {backstoryParagraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
};

export default BackstoryPanel;
