const actions = [
  {
    name: "Great Weapon Master: All In",
    detail: "Action",
  },
  {
    name: "Great Weapon Master: Bonus Attack",
    detail: "Bonus Action",
  },
  {
    name: "Vow of Enmity",
    detail: "Bonus Action",
  },
  {
    name: "Lay on Hands",
    detail: "Action",
  },
];

const V2ActionsPanel = () => {
  return (
    <article className="v2-overview-panel v2-actions-panel">
      <header className="v2-overview-panel-header">
        <h2>Actions</h2>
      </header>

      <ul className="v2-actions-list">
        {actions.map((action) => (
          <li key={action.name} className="v2-action-item">
            <p>{action.name}</p>
            <span>{action.detail}</span>
          </li>
        ))}
      </ul>
    </article>
  );
};

export default V2ActionsPanel;
