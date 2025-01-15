//----------------------
//  src > layout > LeftDisplay.jsx
//----------------------

//----------------------
//  imports
//----------------------
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

import Left_Curlicue_Icon from "../assets/layout/left_display/gold_curl_curlicue_left.svg";
import Right_Curlicue_Icon from "../assets/layout/left_display/gold_curl_curlicue_right.svg";

import FeaturePopup from "../components/layout/FeaturePopup";

//----------------------
//  main
//----------------------
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
      <div className="attributes shared-margin-small">
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

      <p className="shared-margin subheading">
        <img src={Left_Curlicue_Icon} alt="Left Curlicue" className="curlicue" />
        Conditions
        <img src={Right_Curlicue_Icon} alt="Right Curlicue" className="curlicue" />
      </p>
      <div className="conditions shared-margin-small">
        {[{ icon: Aura_of_Protection_Icon, text: "Aura of Protection", popupContent: <p>Gives allies within 10 feet a +3 bonus to saving throws.</p> }].map((item, index) => (
          <FeaturePopup key={index} icon={item.icon} text={item.text} popupContent={item.popupContent} />
        ))}
      </div>

      <p className="shared-margin subheading">
        <img src={Left_Curlicue_Icon} alt="Left Curlicue" className="curlicue" />
        Resistances
        <img src={Right_Curlicue_Icon} alt="Right Curlicue" className="curlicue" />
      </p>
      <div className="resistances shared-margin-small">
        {[Slashing_Resistance_Icon, Piercing_Resistance_Icon].map((icon, index) => (
          <img key={index} src={icon} alt="Res" className="resistance-icon" />
        ))}
      </div>

      <p className="shared-margin subheading">
        <img src={Left_Curlicue_Icon} alt="Left Curlicue" className="curlicue" />
        Notable Features
        <img src={Right_Curlicue_Icon} alt="Right Curlicue" className="curlicue" />
      </p>
      <div className="features shared-margin">
        {[
          {
            icon: Great_Weapon_Master_All_In,
            text: "Great Weapon Master: All In",
            popupContent: <p>Deal extra damage at the cost of accuracy.</p>,
          },
          {
            icon: Great_Weapon_Master_Bonus_Attack,
            text: "Great Weapon Master: Bonus Attack",
            popupContent: <p>Gain an additional attack after a critical hit or reducing a creature to 0 HP.</p>,
          },
          {
            icon: Great_Weapon_Fighting,
            text: "Great Weapon Fighting",
            popupContent: <p>Reroll 1s and 2s on damage dice with two-handed weapons.</p>,
          },
          {
            icon: Savage_Attacker_Icon,
            text: "Savage Attacker",
            popupContent: <p>Once per turn, reroll damage for a melee weapon attack.</p>,
          },
          {
            icon: Extra_Attack_Icon,
            text: "Extra Attack",
            popupContent: <p>Attack twice whenever you take the Attack action.</p>,
          },
          {
            icon: Divine_Health_Icon,
            text: "Divine Health",
            popupContent: <p>Immune to disease.</p>,
          },
          {
            icon: Divine_Tenets_Icon,
            text: "Oath of Vengeance Tenets",
            popupContent: <p>Sworn to uphold the tenets of vengeance.</p>,
          },
          {
            icon: Divine_Intervention_Icon,
            text: "Favoured by the Gods",
            popupContent: <p>Once per short rest, add 2d4 to a failed saving throw or missed attack roll.</p>,
          },
          {
            icon: Darkvision_Icon,
            text: "Darkvision",
            popupContent: <p>See in dim light within 60 feet as if it were bright light.</p>,
          },
          {
            icon: Draconic_Resistance_Icon,
            text: "Draconic Resilience",
            popupContent: <p>Gain a +1 bonus to AC and resistance to a damage type.</p>,
          },
          {
            icon: Fey_Ancestry_Icon,
            text: "Fey Ancestry",
            popupContent: <p>Advantage on saving throws against being charmed, and magic cannot put you to sleep.</p>,
          },
          {
            icon: Curse_Icon,
            text: "Rhea's Divine Punishment",
            popupContent: <p>Inflict a divine curse on enemies.</p>,
          },
        ].map((feature, index) => (
          <FeaturePopup key={index} icon={feature.icon} text={feature.text} popupContent={feature.popupContent} />
        ))}
      </div>
    </div>
  );
};

//----------------------
//  exports
//----------------------
export default LeftDisplay;
