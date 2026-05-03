import V2SlotTile from "./V2SlotTile";
import V2CombatReadout from "./V2CombatReadout";

const LEFT_RAIL = [
  { id: "head", label: "Head", glyph: "H" },
  { id: "chest", label: "Chest", glyph: "C" },
  { id: "gloves", label: "Gloves", glyph: "G" },
  { id: "boots", label: "Boots", glyph: "B" },
  { id: "cloak", label: "Cloak", glyph: "K" },
];

const RIGHT_RAIL = [
  { id: "amulet", label: "Amulet", glyph: "A" },
  { id: "ring1", label: "Ring", glyph: "R" },
  { id: "ring2", label: "Ring", glyph: "R" },
  { id: "trinket", label: "Trinket", glyph: "T" },
];

const V2PaperDoll = ({ equipped = {}, itemById = {} }) => {
  const itemFor = (slotId) => itemById[equipped[slotId]] ?? null;

  return (
    <article className="v2-overview-panel v2-inventory-doll-panel">
      <div className="v2-doll-stage">
        <div className="v2-doll-rail is-left" aria-label="Armor slots">
          {LEFT_RAIL.map((slot) => {
            const item = itemFor(slot.id);
            return (
              <V2SlotTile
                key={slot.id}
                slotLabel={slot.label}
                slotGlyph={slot.glyph}
                size="small"
                item={item}
                equippedBy={item ? "Sariel" : null}
              />
            );
          })}
        </div>

        <div className="v2-doll-portrait" aria-hidden="true">
          <div className="v2-doll-portrait-frame">
            <span className="v2-doll-portrait-placeholder">Sariel</span>
          </div>
        </div>

        <div className="v2-doll-rail is-right" aria-label="Accessory slots">
          {RIGHT_RAIL.map((slot) => {
            const item = itemFor(slot.id);
            return (
              <V2SlotTile
                key={slot.id}
                slotLabel={slot.label}
                slotGlyph={slot.glyph}
                size="small"
                item={item}
                equippedBy={item ? "Sariel" : null}
              />
            );
          })}
        </div>
      </div>

      <V2CombatReadout
        mainHand={itemFor("mainHand")}
        offHand={itemFor("offHand")}
        ranged={itemFor("ranged")}
      />
    </article>
  );
};

export default V2PaperDoll;
