import "../styles/layout/left-display.scss";
import Sariel_PFP from "../assets/layout/left_display/sariel_pfp.png";
import Vengeance_Paladin_Icon from "../assets/layout/left_display/Class_Paladin_Badge_Icon.png";
import AC_Icon from "../assets/layout/left_display/AC_Icon.png";
import Gold_Icon from "../assets/layout/left_display/gold_icon.png";
import Aura_of_Protection_Icon from "../assets/layout/left_display/120px-Aura_of_Protection_Icon.webp.png";

import Slashing_Resistance_Icon from "../assets/layout/left_display/79px-Slashing_Resistance_NM.png";
import Piercing_Resistance_Icon from "../assets/layout/left_display/79px-Piercing_Resistance_NM.png";

import Great_Weapon_Master_All_In from "../assets/layout/left_display/120px-Great_Weapon_Master_All_In_Icon.webp.png";
import Great_Weapon_Master_Bonus_Attack from "../assets/layout/left_display/120px-Great_Weapon_Master_Icon.webp.png";
import Divine_Health_Icon from "../assets/layout/left_display/120px-Divine_Health_Icon.png";
import Extra_Attack_Icon from "../assets/layout/left_display/120px-Extra_Attack_Icon.webp.png";
import Fey_Ancestry_Icon from "../assets/layout/left_display/120px-Fey_Ancestry_Icon.webp.png";
import Great_Weapon_Fighting from "../assets/layout/left_display/120px-Great_Weapon_Fighting_Icon.webp.png";
import Divine_Tenets_Icon from "../assets/layout/left_display/120px-Divine_Intervention_Arm_Thy_Servant_Icon.webp.png";
import Savage_Attacker_Icon from "../assets/layout/left_display/120px-Savage_Attacker_Icon.webp.png";
import Divine_Intervention_Icon from "../assets/layout/left_display/120px-Divine_Intervention_Sunder_the_Heretical_Icon.webp.png";
import Darkvision_Icon from "../assets/layout/left_display/120px-Darkvision_Icon.webp.png";
import Draconic_Resistance_Icon from "../assets/layout/left_display/120px-Draconic_Resilience_Icon.webp.png";
import Curse_Icon from "../assets/layout/left_display/120px-Bestow_Curse_Debuff_Ability_Icon.webp.png";

const LeftDisplay = () => {
  return (
    <div className="left-display-content">
      <div className="left-display-header shared-margin">
        <h5 className="character-name">Sariel Hewlett</h5>
        <div className="currency">
          <p>6</p>
          <img src={Gold_Icon} alt="GP" className="currency-icon" />
        </div>
      </div>
      <div className="image-container shared-margin">
        <img src={Sariel_PFP} alt="Character" className="character-image" />
      </div>
      <div className="image-container shared-margin">
        <img src={AC_Icon} alt="AC" className="overlay-image" />
        <p className="overlay-text">18</p>
      </div>
      <p className="race shared-margin">Wood Half-Elf</p>
      <div className="image-container shared-margin">
        <img src={Vengeance_Paladin_Icon} alt="Paladin" className="class-image" />
      </div>
      <p className="shared-margin">Level 5 Paladin / Level 1 Sorcerer</p>
      <div className="attributes shared-margin">
        {[
          { label: "STR", value: 16 },
          { label: "DEX", value: 12 },
          { label: "CON", value: 14 },
          { label: "INT", value: 8 },
          { label: "WIS", value: 10 },
          { label: "CHA", value: 14 },
        ].map((attr, index) => (
          <div key={index} className="attribute">
            <p>{attr.label}</p>
            <p className="attribute-value">{attr.value}</p>
          </div>
        ))}
      </div>
      <p className="shared-margin">Conditions</p>
      <div className="conditions shared-margin">
        {[{ icon: Aura_of_Protection_Icon, text: "Aura of Protection" }].map((item, index) => (
          <div key={index} className="condition-item">
            <img src={item.icon} alt="Con" />
            <p>{item.text}</p>
          </div>
        ))}
      </div>
      <p className="shared-margin">Resistances</p>
      <div className="resistances shared-margin">
        {[Slashing_Resistance_Icon, Piercing_Resistance_Icon].map((icon, index) => (
          <img key={index} src={icon} alt="Res" className="resistance-icon" />
        ))}
      </div>
      <p className="shared-margin">Notable Features</p>
      <div className="features shared-margin">
        {[
          { icon: Great_Weapon_Master_All_In, text: "Great Weapon Master: All In" },
          { icon: Great_Weapon_Master_Bonus_Attack, text: "Great Weapon Master: Bonus Attack" },
          { icon: Great_Weapon_Fighting, text: "Great Weapon Fighting" },
          { icon: Savage_Attacker_Icon, text: "Savage Attacker" },
          { icon: Extra_Attack_Icon, text: "Extra Attack" },
          { icon: Divine_Health_Icon, text: "Divine Health" },
          { icon: Divine_Tenets_Icon, text: "Oath of Vengeance Tenets" },
          { icon: Divine_Intervention_Icon, text: "Favoured by the Gods" },
          { icon: Darkvision_Icon, text: "Darkvision" },
          { icon: Draconic_Resistance_Icon, text: "Draconic Resilience" },
          { icon: Fey_Ancestry_Icon, text: "Fey Ancestry" },
          { icon: Curse_Icon, text: "Rhea's Divine Punishment" },
        ].map((item, index) => (
          <div key={index} className="feature-item">
            <img src={item.icon} alt="Feat" />
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftDisplay;
