const CATEGORIES = ["All", "Weapons", "Armor", "Consumables", "Misc"];

const InventoryFilterBar = ({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  currentWeight,
  maxWeight,
}) => {
  const ratio = maxWeight > 0 ? Math.min(currentWeight / maxWeight, 1) : 0;
  const tone =
    ratio > 0.95
      ? "is-overburdened"
      : ratio > 0.75
        ? "is-strained"
        : "is-clear";

  return (
    <header className="inventory-filter-bar">
      <div
        className="inventory-filter-chips"
        role="tablist"
        aria-label="Item category"
      >
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={activeCategory === category}
            className={
              activeCategory === category
                ? "inventory-filter-chip is-active"
                : "inventory-filter-chip"
            }
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <input
        type="search"
        className="inventory-search"
        placeholder="Search items…"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        aria-label="Search inventory"
      />

      <div
        className={`inventory-weight ${tone}`}
        aria-label={`Carrying ${currentWeight} of ${maxWeight} pounds`}
      >
        <span className="inventory-weight-readout">
          {currentWeight} / {maxWeight}
        </span>
        <div className="inventory-weight-track" aria-hidden="true">
          <div
            className="inventory-weight-fill"
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      </div>
    </header>
  );
};

export default InventoryFilterBar;
