import { useMemo, useState } from "react";
import InventoryFilterBar from "./InventoryFilterBar";
import PaperDoll from "./PaperDoll";
import BagGrid from "./BagGrid";
import {
  SARIEL_ITEMS,
  SARIEL_EQUIPPED,
  SARIEL_WEIGHT,
} from "@/data/character/inventory";
import "./inventory.scss";

const InventoryPage = () => {
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
    <section className="page inventory-page">
      <InventoryFilterBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentWeight={SARIEL_WEIGHT.current}
        maxWeight={SARIEL_WEIGHT.max}
      />
      <div className="inventory-grid">
        <PaperDoll equipped={SARIEL_EQUIPPED} itemById={itemById} />
        <BagGrid
          items={bagItems}
          activeCategory={activeCategory}
          searchQuery={searchQuery}
        />
      </div>
    </section>
  );
};

export default InventoryPage;
