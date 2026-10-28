import { useMemo } from "react";
import SlotTile from "./SlotTile";

const SLOT_COUNT = 64;

const BagGrid = ({ items = [], activeCategory = "All", searchQuery = "" }) => {
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
    <article className="overview-panel inventory-bag-panel">
      <header className="overview-panel-header">
        <h2>Inventory</h2>
        <span className="bag-capacity-readout">
          {filledCount} / {SLOT_COUNT}
        </span>
      </header>

      <div className="bag-grid" role="grid" aria-label="Bag contents">
        {filtered.map((item) => (
          <SlotTile key={item.id} item={item} />
        ))}
        {Array.from({ length: padding }).map((_, index) => (
          <SlotTile
            key={`empty-${index}`}
            slotLabel={`Slot ${filledCount + index + 1}`}
          />
        ))}
      </div>
    </article>
  );
};

export default BagGrid;
