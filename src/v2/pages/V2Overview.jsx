const V2Overview = () => {
  return (
    <section className="v2-page">
      <h2>Overview</h2>
      <p>
        This is your clean-room area for the redesign. Keep legacy behavior as a
        reference, but rebuild each feature with new patterns.
      </p>

      <div className="v2-card-grid">
        <article className="v2-card">
          <h3>Foundation</h3>
          <ul>
            <li>Create design tokens (color, spacing, radius, typography).</li>
            <li>Set up a consistent responsive breakpoint strategy.</li>
            <li>Define shared primitive UI components.</li>
          </ul>
        </article>

        <article className="v2-card">
          <h3>Data Model</h3>
          <ul>
            <li>
              Move static character content into typed, reusable structures.
            </li>
            <li>Split game state from display-only metadata.</li>
            <li>Add validation for uploaded assets and user edits.</li>
          </ul>
        </article>

        <article className="v2-card">
          <h3>Interaction</h3>
          <ul>
            <li>
              Replace hover-only interactions with click and keyboard support.
            </li>
            <li>Add touch-friendly hit areas for mobile sessions.</li>
            <li>Use focused motion for panel transitions and state changes.</li>
          </ul>
        </article>

        <article className="v2-card">
          <h3>Delivery</h3>
          <ul>
            <li>Keep features behind v2 routes until they are stable.</li>
            <li>Run lint/build checks as each module lands.</li>
            <li>Retire legacy routes only when parity is complete.</li>
          </ul>
        </article>
      </div>
    </section>
  );
};

export default V2Overview;
