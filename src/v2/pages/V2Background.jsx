const V2Background = () => {
  return (
    <section className="v2-page">
      <h2>Background</h2>
      <p>
        Use this page to prototype your narrative layout for backstory, ideals,
        bonds, and flaws without touching the legacy implementation.
      </p>

      <div className="v2-card-grid">
        <article className="v2-card">
          <h3>Content Direction</h3>
          <p>
            Decide if this section should feel like a codex, journal, or
            portrait dossier. Build one visual system and apply it consistently.
          </p>
        </article>

        <article className="v2-card">
          <h3>Layout Ideas</h3>
          <p>
            Test two-column desktop and single-column mobile variants early.
            Keep text readable at multiple browser zoom levels.
          </p>
        </article>
      </div>
    </section>
  );
};

export default V2Background;
