import D6_Icon from "../../../../assets/spellcasting/D6_Physical.png";
import Spell_Save_Icon from "../../../../assets/spellcasting/Spell_Save_DC_HUD_Icon.png";
import Gold_Star_Icon from "../../../../assets/layout/left_display/Gold_Star_Icon.png";

const spellcastingStats = [
  {
    key: "ability",
    label: "Spellcasting",
    value: "CHA",
    icon: Gold_Star_Icon,
    alt: "Spellcasting ability",
  },
  {
    key: "save",
    label: "Spell Save",
    value: "13",
    icon: Spell_Save_Icon,
    alt: "Spell save DC",
  },
  {
    key: "attack",
    label: "Spell Attack",
    value: "+5",
    icon: D6_Icon,
    alt: "Spell attack",
  },
];

const V2SpellcastingPanel = () => {
  return (
    <article className="v2-overview-panel v2-spellcasting-panel">
      <header className="v2-overview-panel-header">
        <h2>Spellcasting</h2>
      </header>

      <div className="v2-spellcasting-grid">
        {spellcastingStats.map((stat) => (
          <div key={stat.key} className="v2-spellcasting-card">
            <img src={stat.icon} alt={stat.alt} />
            <span className="v2-label">{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
};

export default V2SpellcastingPanel;
