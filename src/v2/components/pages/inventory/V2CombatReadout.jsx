import V2SlotTile from "./V2SlotTile";

const V2CombatReadout = ({ mainHand, offHand, ranged, armorClass = 18 }) => {
  return (
    <section className="v2-combat-readout" aria-label="Combat readout">
      <div className="v2-combat-tile is-melee">
        <V2SlotTile
          item={mainHand}
          slotLabel="Main hand"
          slotGlyph="⚔"
          size="large"
        />
        <div className="v2-combat-tile-body">
          <span className="v2-combat-tile-label">Melee</span>
          <span className="v2-combat-tile-value">+0</span>
          <span className="v2-combat-tile-detail">—</span>
        </div>
      </div>

      <div className="v2-combat-tile is-ac">
        <div className="v2-combat-ac-shield" aria-hidden="true">
          <span className="v2-combat-ac-value">{armorClass}</span>
        </div>
        <span className="v2-combat-tile-label">AC</span>
      </div>

      <div className="v2-combat-tile is-ranged">
        <V2SlotTile
          item={ranged}
          slotLabel="Ranged"
          slotGlyph="🏹"
          size="large"
        />
        <div className="v2-combat-tile-body">
          <span className="v2-combat-tile-label">Ranged</span>
          <span className="v2-combat-tile-value">+0</span>
          <span className="v2-combat-tile-detail">—</span>
        </div>
      </div>

      {offHand !== undefined && (
        <div className="v2-combat-tile is-offhand">
          <V2SlotTile
            item={offHand}
            slotLabel="Off hand"
            slotGlyph="◐"
            size="medium"
          />
        </div>
      )}
    </section>
  );
};

export default V2CombatReadout;
