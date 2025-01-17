//----------------------
//  src > components > pages > overview > SpellcastingModifierContainer.jsx
//----------------------

//----------------------
//  imports
//----------------------
import "../../../styles/components/pages/overview/spellcasting-modifier-container.scss";

import D6_Icon from "../../../assets/spellcasting/D6_Physical.png";
import Spell_Save_Icon from "../../../assets/spellcasting/Spell_Save_DC_HUD_Icon.png";
import Gold_Star_Icon from "../../../assets/layout/left_display/Gold_Star_Icon.png";

//----------------------
//  main
//----------------------
const SpellcastingModifierContainer = () => {
  return (
    <div className="spellcasting-modifier-container">
      <div className="spellcasting-ability">
        <img className="gold-star-icon" src={Gold_Star_Icon} alt="Spell Star" />
        CHA
      </div>

      <div className="spell-save-dc">
        <img className="spell-save-icon" src={Spell_Save_Icon} alt="Spell Save" />
        13
      </div>

      <div className="spell-attack">
        <img className="spell-attack-icon" src={D6_Icon} alt="Spell Attack" />
        +5
      </div>
    </div>
  );
};

//----------------------
//  exports
//----------------------
export default SpellcastingModifierContainer;
