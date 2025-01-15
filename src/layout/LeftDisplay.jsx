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

import Left_Curlicue_Icon from "../assets/layout/left_display/gold_curl_curlicue_left.svg";
import Right_Curlicue_Icon from "../assets/layout/left_display/gold_curl_curlicue_right.svg";
import FeaturePopup from "../components/layout/FeaturePopup";
import featuresData from "../data/featuresData";

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
      {/* <div className="conditions shared-margin-small">
        {[{ icon: Aura_of_Protection_Icon, text: "Aura of Protection", popupContent: <p>Gives allies within 10 feet a +3 bonus to saving throws.</p> }].map((item, index) => (
          <FeaturePopup key={index} icon={item.icon} text={item.text} popupContent={item.popupContent} />
        ))}
      </div> */}

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
          <FeaturePopup key={index} popupContent={<p>{feature.popupContent}</p>}>
            <div className="feature-content">
              <img src={feature.icon} alt={feature.text} className="hover-icon" />
              <p>{feature.text}</p>
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
