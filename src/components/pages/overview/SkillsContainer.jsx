//----------------------
//  src > components > pages > overview > SkillsContainer.jsx
//----------------------

//----------------------
//  imports
//----------------------
import React from "react";

import Acrobatics_Icon from "../../../assets/skills/Acrobatics_Icon.png";
import Animal_Handling_Icon from "../../../assets/skills/Animal_Handling_Icon.png";
import Arcana_Icon from "../../../assets/skills/Arcana_Icon.png";
import Athletics_Icon from "../../../assets/skills/Athletics_Icon.png";
import Deception_Icon from "../../../assets/skills/Deception_Icon.png";
import History_Icon from "../../../assets/skills/History_Icon.png";
import Insight_Icon from "../../../assets/skills/Insight_Icon.png";
import Intimidation_Icon from "../../../assets/skills/Intimidation_Icon.png";
import Investigation_Icon from "../../../assets/skills/Investigation_Icon.png";
import Medicine_Icon from "../../../assets/skills/Medicine_Icon.png";
import Nature_Icon from "../../../assets/skills/Nature_Icon.png";
import Perception_Icon from "../../../assets/skills/Perception_Icon.png";
import Performance_Icon from "../../../assets/skills/Performance_Icon.png";
import Persuasion_Icon from "../../../assets/skills/Persuasion_Icon.png";
import Religion_Icon from "../../../assets/skills/Religion_Icon.png";
import Stealth_Icon from "../../../assets/skills/Stealth_Icon.png";
import Sleight_of_Hand_Icon from "../../../assets/skills/Sleight_of_Hand_Icon.png";
import Survival_Icon from "../../../assets/skills/Survival_Icon.png";

import Gold_Star_Icon from "../../../assets/layout/left_display/Gold_Star_Icon.png";

import "../../../styles/components/pages/overview/skills-container.scss";

// Mock Data
const skillsData = [
  {
    attribute: "Strength (+3)",
    skills: [{ icon: Athletics_Icon, name: "Athletics", isProficient: true, modifier: "+6" }],
  },
  {
    attribute: "Dexterity (+1)",
    skills: [
      { icon: Acrobatics_Icon, name: "Acrobatics", isProficient: false, modifier: "+1" },
      { icon: Stealth_Icon, name: "Stealth", isProficient: false, modifier: "+1" },
      { icon: Sleight_of_Hand_Icon, name: "Sleight of Hand", isProficient: false, modifier: "+1" },
    ],
  },
  {
    attribute: "Intelligence (-1)",
    skills: [
      { icon: Investigation_Icon, name: "Investigation", isProficient: false, modifier: "-1" },
      { icon: History_Icon, name: "History", isProficient: false, modifier: "-1" },
      { icon: Arcana_Icon, name: "Arcana", isProficient: false, modifier: "-1" },
      { icon: Nature_Icon, name: "Nature", isProficient: false, modifier: "-1" },
      { icon: Religion_Icon, name: "Religion", isProficient: false, modifier: "-1" },
    ],
  },
  {
    attribute: "Wisdom (0)",
    skills: [
      { icon: Animal_Handling_Icon, name: "Animal Handling", isProficient: false, modifier: "0" },
      { icon: Insight_Icon, name: "Insight", isProficient: true, modifier: "+3" },
      { icon: Medicine_Icon, name: "Medicine", isProficient: false, modifier: "0" },
      { icon: Perception_Icon, name: "Perception", isProficient: true, modifier: "+3" },
      { icon: Survival_Icon, name: "Survival", isProficient: false, modifier: "0" },
    ],
  },
  {
    attribute: "Charisma (+2)",
    skills: [
      { icon: Performance_Icon, name: "Performance", isProficient: true, modifier: "+5" },
      { icon: Deception_Icon, name: "Deception", isProficient: true, modifier: "+5" },
      { icon: Intimidation_Icon, name: "Intimidation", isProficient: false, modifier: "+2" },
      { icon: Persuasion_Icon, name: "Persuasion", isProficient: true, modifier: "+5" },
    ],
  },
];

//----------------------
//  Component
//----------------------
const SkillsContainer = () => {
  return (
    <div className="skills-container">
      <p className="proficiency-title">
        <img className="gold-star" src={Gold_Star_Icon} alt="Proficiency Star" />
        Proficiency Bonus (+3)
      </p>
      {skillsData.map((attribute) => (
        <div key={attribute.attribute} className="attribute-container">
          <p className="attribute-title">{attribute.attribute}</p>
          <ul className="skills-list">
            {attribute.skills.map((skill, index) => (
              <li key={index} className={`skill-item ${skill.isProficient ? "proficient" : ""}`}>
                <div className="skill-info">
                  <img className="icon" src={skill.icon} alt={skill.name} />
                  <p className="name">{skill.name}</p>
                </div>
                <span className="modifier">
                  {skill.isProficient && <img className="gold-star" src={Gold_Star_Icon} alt="Proficient Star" />}
                  <p>{skill.modifier}</p>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

//----------------------
//  exports
//----------------------
export default SkillsContainer;
