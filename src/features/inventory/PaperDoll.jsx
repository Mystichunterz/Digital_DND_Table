import SlotTile from "./SlotTile";
import CombatReadout from "./CombatReadout";

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

const PaperDoll = ({ equipped = {}, itemById = {} }) => {
  const itemFor = (slotId) => itemById[equipped[slotId]] ?? null;

  return (
    <article className="panel inventory-doll-panel">
      <div className="doll-stage">
        <div className="doll-rail is-left" aria-label="Armor slots">
          {LEFT_RAIL.map((slot) => {
            const item = itemFor(slot.id);
            return (
              <SlotTile
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

        <div className="doll-portrait" aria-hidden="true">
          <div className="doll-portrait-frame">
            <span className="doll-portrait-placeholder">Sariel</span>
          </div>
        </div>

        <div className="doll-rail is-right" aria-label="Accessory slots">
          {RIGHT_RAIL.map((slot) => {
            const item = itemFor(slot.id);
            return (
              <SlotTile
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

      <CombatReadout
        mainHand={itemFor("mainHand")}
        offHand={itemFor("offHand")}
        ranged={itemFor("ranged")}
      />
    </article>
  );
};

export default PaperDoll;
