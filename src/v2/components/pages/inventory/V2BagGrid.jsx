import { useMemo } from "react";
import V2SlotTile from "./V2SlotTile";

const SLOT_COUNT = 64;

const V2BagGrid = ({ items = [], activeCategory = "All", searchQuery = "" }) => {
  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      if (activeCategory !== "All" && item.category !== activeCategory) {
        return false;
      }
      if (query && !item.name.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [items, activeCategory, searchQuery]);

  const padding = Math.max(0, SLOT_COUNT - filtered.length);
  const filledCount = filtered.length;

  return (
    <article className="v2-overview-panel v2-inventory-bag-panel">
      <header className="v2-overview-panel-header">
        <h2>Inventory</h2>
        <span className="v2-bag-capacity-readout">
          {filledCount} / {SLOT_COUNT}
        </span>
      </header>

      <div className="v2-bag-grid" role="grid" aria-label="Bag contents">
        {filtered.map((item) => (
          <V2SlotTile key={item.id} item={item} />
        ))}
        {Array.from({ length: padding }).map((_, index) => (
          <V2SlotTile
            key={`empty-${index}`}
            slotLabel={`Slot ${filledCount + index + 1}`}
          />
        ))}
      </div>
    </article>
  );
};

export default V2BagGrid;
