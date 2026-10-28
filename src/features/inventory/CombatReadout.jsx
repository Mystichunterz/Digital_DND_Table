import SlotTile from "./SlotTile";

const WEAPON_STATS = {
  longsword: { attack: "+6", damage: "1d10+3", type: "slashing" },
  spear: { attack: "+6", damage: "1d8+3", type: "piercing" },
  javelin: { attack: "+6", damage: "1d6+3", type: "piercing" },
  shield: { attack: "—", damage: "—", type: "" },
};

const renderStats = (item) => {
  if (!item) return { attack: "+0", damage: "—", type: "" };
  return WEAPON_STATS[item.id] ?? { attack: "+0", damage: "—", type: "" };
};

const CombatReadout = ({ mainHand, offHand, ranged, armorClass = 18 }) => {
  const meleeStats = renderStats(mainHand);
  const rangedStats = renderStats(ranged);

  return (
    <section className="combat-readout" aria-label="Combat readout">
      <div className="combat-tile is-melee">
        <SlotTile
          item={mainHand}
          slotLabel="Main hand"
          slotGlyph="⚔"
          size="large"
          equippedBy={mainHand ? "Sariel" : null}
        />
        <div className="combat-tile-body">
          <span className="combat-tile-label">Melee</span>
          <span className="combat-tile-value">{meleeStats.attack}</span>
          <span className="combat-tile-detail">{meleeStats.damage}</span>
        </div>
      </div>

      <div className="combat-tile is-ac">
        <div className="combat-ac-shield" aria-hidden="true">
          <span className="combat-ac-value">{armorClass}</span>
        </div>
        <span className="combat-tile-label">AC</span>
      </div>

      <div className="combat-tile is-ranged">
        <SlotTile
          item={ranged}
          slotLabel="Ranged"
          slotGlyph="🏹"
          size="large"
          equippedBy={ranged ? "Sariel" : null}
        />
        <div className="combat-tile-body">
          <span className="combat-tile-label">Ranged</span>
          <span className="combat-tile-value">{rangedStats.attack}</span>
          <span className="combat-tile-detail">{rangedStats.damage}</span>
        </div>
      </div>

      {offHand !== undefined && offHand !== null && (
        <div className="combat-tile is-offhand">
          <SlotTile
            item={offHand}
            slotLabel="Off hand"
            slotGlyph="◐"
            size="medium"
            equippedBy="Sariel"
          />
        </div>
      )}
    </section>
  );
};

export default CombatReadout;
