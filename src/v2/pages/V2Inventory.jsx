import { useMemo, useState } from "react";
import V2InventoryFilterBar from "../components/pages/inventory/V2InventoryFilterBar";
import V2PaperDoll from "../components/pages/inventory/V2PaperDoll";
import V2BagGrid from "../components/pages/inventory/V2BagGrid";
import {
  SARIEL_ITEMS,
  SARIEL_EQUIPPED,
  SARIEL_WEIGHT,
} from "../data/sarielInventory";
import "../styles/pages/v2-inventory.scss";

const V2Inventory = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const itemById = useMemo(
    () => Object.fromEntries(SARIEL_ITEMS.map((item) => [item.id, item])),
    [],
  );

  const equippedIds = useMemo(
    () => new Set(Object.values(SARIEL_EQUIPPED)),
    [],
  );

  const bagItems = useMemo(
    () => SARIEL_ITEMS.filter((item) => !equippedIds.has(item.id)),
    [equippedIds],
  );

  return (
    <section className="v2-page v2-inventory-page">
      <V2InventoryFilterBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentWeight={SARIEL_WEIGHT.current}
        maxWeight={SARIEL_WEIGHT.max}
      />
      <div className="v2-inventory-grid">
        <V2PaperDoll equipped={SARIEL_EQUIPPED} itemById={itemById} />
        <V2BagGrid
          items={bagItems}
          activeCategory={activeCategory}
          searchQuery={searchQuery}
        />
      </div>
    </section>
  );
};

export default V2Inventory;
