import V2SlotTile from "./V2SlotTile";

const SLOT_COUNT = 64;

const V2BagGrid = () => {
  return (
    <article className="v2-overview-panel v2-inventory-bag-panel">
      <header className="v2-overview-panel-header">
        <h2>Inventory</h2>
        <span className="v2-bag-capacity-readout">
          0 / {SLOT_COUNT}
        </span>
      </header>

      <div className="v2-bag-grid" role="grid" aria-label="Bag contents">
        {Array.from({ length: SLOT_COUNT }).map((_, index) => (
          <V2SlotTile
            key={index}
            slotLabel={`Slot ${index + 1}`}
          />
        ))}
      </div>
    </article>
  );
};

export default V2BagGrid;
