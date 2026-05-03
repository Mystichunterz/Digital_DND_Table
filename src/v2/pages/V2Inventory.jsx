import { useState } from "react";
import V2InventoryFilterBar from "../components/pages/inventory/V2InventoryFilterBar";
import V2PaperDoll from "../components/pages/inventory/V2PaperDoll";
import V2BagGrid from "../components/pages/inventory/V2BagGrid";
import "../styles/pages/v2-inventory.scss";

const V2Inventory = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="v2-page v2-inventory-page">
      <V2InventoryFilterBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentWeight={110}
        maxWeight={240}
      />
      <div className="v2-inventory-grid">
        <V2PaperDoll />
        <V2BagGrid
          activeCategory={activeCategory}
          searchQuery={searchQuery}
        />
      </div>
    </section>
  );
};

export default V2Inventory;
