const OptionTabStrip = ({ className, ariaLabel, tabs, activeId, onSelect }) => (
  <div className={className} role="tablist" aria-label={ariaLabel}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        className={activeId === tab.id ? "is-active" : ""}
        role="tab"
        aria-selected={activeId === tab.id}
        onClick={() => onSelect(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default OptionTabStrip;
