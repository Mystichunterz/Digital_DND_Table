import V2SlotTile from "./V2SlotTile";

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

const V2CombatReadout = ({ mainHand, offHand, ranged, armorClass = 18 }) => {
  const meleeStats = renderStats(mainHand);
  const rangedStats = renderStats(ranged);

  return (
    <section className="v2-combat-readout" aria-label="Combat readout">
      <div className="v2-combat-tile is-melee">
        <V2SlotTile
          item={mainHand}
          slotLabel="Main hand"
          slotGlyph="⚔"
          size="large"
          equippedBy={mainHand ? "Sariel" : null}
        />
        <div className="v2-combat-tile-body">
          <span className="v2-combat-tile-label">Melee</span>
          <span className="v2-combat-tile-value">{meleeStats.attack}</span>
          <span className="v2-combat-tile-detail">{meleeStats.damage}</span>
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
          equippedBy={ranged ? "Sariel" : null}
        />
        <div className="v2-combat-tile-body">
          <span className="v2-combat-tile-label">Ranged</span>
          <span className="v2-combat-tile-value">{rangedStats.attack}</span>
          <span className="v2-combat-tile-detail">{rangedStats.damage}</span>
        </div>
      </div>

      {offHand !== undefined && offHand !== null && (
        <div className="v2-combat-tile is-offhand">
          <V2SlotTile
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

export default V2CombatReadout;
