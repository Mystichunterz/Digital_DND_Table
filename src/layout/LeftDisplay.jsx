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

import Star_Icon from "../assets/layout/left_display/Gold_Star_Icon.png";
import Dice_Icon from "../assets/layout/left_display/Ability_Score_Proficiency_Icon.png";

import Slashing_Resistance_Icon from "../assets/layout/left_display/79px-Slashing_Resistance_NM.png";
import Piercing_Resistance_Icon from "../assets/layout/left_display/79px-Piercing_Resistance_NM.png";

import Left_Curlicue_Icon from "../assets/layout/left_display/gold_curl_curlicue_left.svg";
import Right_Curlicue_Icon from "../assets/layout/left_display/gold_curl_curlicue_right.svg";

import AbilityScorePopup from "../components/popups/AbilityScorePopup";
import FeaturePopup from "../components/popups/FeaturePopup";
import ConditionPopup from "../components/popups/ConditionPopup";
import InformationPopup from "../components/popups/InformationPopup";

import abilityScoresData from "../data/abilityScoresData";
import conditionsData from "../data/conditionsData";
import featuresData from "../data/featuresData";

//----------------------
//  main
//----------------------
const LeftDisplay = () => {
  const processConditionDuration = (duration) => {
    if (duration === "Permanent") {
      return null;
      // if condition has a number, return that only the number
    } else if (duration.match(/\d+/)) {
      return `${duration.match(/\d+/)[0]}`;
    } else {
      return duration;
    }
  };

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
      <div className="attributes">
        {abilityScoresData.map((attr, index) => (
          <div key={index} className="attribute-wrapper">
            {/* Star icon for primary abilities - Independent InformationPopup */}
            {attr.isPrimary && (
              <InformationPopup title="Primary Ability" subtitle="This is your primary ability.">
                <div className="primary-icon-container">
                  <img src={Star_Icon} alt="Primary Ability" className="primary-icon" />
                </div>
              </InformationPopup>
            )}

            {/* Ability Score Popup wraps only the attribute itself */}
            <AbilityScorePopup icon={attr.icon} title={attr.title} subtitle="Ability" text={attr.description} value={attr.value} isPrimary={attr.isPrimary} isProficient={attr.isProficient} savingThrows={attr.savingThrows} sources={attr.sources}>
              <div className="attribute">
                <p>{attr.label}</p>

                {/* Dice icon for proficient abilities */}
                <div className="attribute-value-container">
                  {attr.isProficient && <img src={Dice_Icon} alt="Proficient Ability" className="proficient-icon" />}
                  <p className="attribute-value">{attr.value}</p>
                </div>
              </div>
            </AbilityScorePopup>
          </div>
        ))}
      </div>

      <p className="shared-margin subheading">
        <img src={Left_Curlicue_Icon} alt="Left Curlicue" className="curlicue" />
        Conditions
        <img src={Right_Curlicue_Icon} alt="Right Curlicue" className="curlicue" />
      </p>
      {/* <div className="conditions shared-margin-small">
        {[{ icon: Aura_of_Protection_Icon, text: "Aura of Protection", popupContent: <p>Gives allies within 10 feet a +3 bonus to saving throws.</p> }].map((item, index) => (
          <FeaturePopup key={index} icon={item.icon} text={item.text} popupContent={item.popupContent} />
        ))}
      </div> */}

      <div className="conditions shared-margin">
        {conditionsData.map((condition, index) => (
          <ConditionPopup key={index} icon={condition.icon} title={condition.title} subtitle={condition.subtitle} text={condition.text} {...(condition.duration ? { duration: condition.duration } : {})}>
            <div className="condition-content">
              <div className="condition-image-container">
                <img src={condition.icon} alt={condition.title} className="condition-icon" />
                {condition.duration && <p className="condition-duration">{processConditionDuration(condition.duration)}</p>}
              </div>
              <p>{condition.title}</p>
            </div>
          </ConditionPopup>
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
        {featuresData.map((feature, index) => (
          <FeaturePopup key={index} icon={feature.icon} title={feature.title} subtitle={feature.subtitle} text={feature.text}>
            <div className="feature-content">
              <img src={feature.icon} alt={feature.title} className="hover-icon" />
              <p>{feature.title}</p>
            </div>
          </FeaturePopup>
        ))}
      </div>
    </div>
  );
};

//----------------------
//  exports
//----------------------
export default LeftDisplay;
