import { useState } from "react";
import Acrobatics_Icon from "../../../../assets/skills/Acrobatics_Icon.png";
import Animal_Handling_Icon from "../../../../assets/skills/Animal_Handling_Icon.png";
import Arcana_Icon from "../../../../assets/skills/Arcana_Icon.png";
import Athletics_Icon from "../../../../assets/skills/Athletics_Icon.png";
import Deception_Icon from "../../../../assets/skills/Deception_Icon.png";
import History_Icon from "../../../../assets/skills/History_Icon.png";
import Insight_Icon from "../../../../assets/skills/Insight_Icon.png";
import Intimidation_Icon from "../../../../assets/skills/Intimidation_Icon.png";
import Investigation_Icon from "../../../../assets/skills/Investigation_Icon.png";
import Medicine_Icon from "../../../../assets/skills/Medicine_Icon.png";
import Nature_Icon from "../../../../assets/skills/Nature_Icon.png";
import Perception_Icon from "../../../../assets/skills/Perception_Icon.png";
import Performance_Icon from "../../../../assets/skills/Performance_Icon.png";
import Persuasion_Icon from "../../../../assets/skills/Persuasion_Icon.png";
import Religion_Icon from "../../../../assets/skills/Religion_Icon.png";
import Stealth_Icon from "../../../../assets/skills/Stealth_Icon.png";
import Sleight_of_Hand_Icon from "../../../../assets/skills/Sleight_of_Hand_Icon.png";
import Survival_Icon from "../../../../assets/skills/Survival_Icon.png";
import Gold_Star_Icon from "../../../../assets/layout/left_display/Gold_Star_Icon.png";
import Left_Curlicue_Icon from "../../../../assets/layout/left_display/gold_curl_curlicue_left.svg";
import Right_Curlicue_Icon from "../../../../assets/layout/left_display/gold_curl_curlicue_right.svg";

const proficienciesData = [
  {
    attribute: "Strength (+3)",
    skills: [
      {
        icon: Athletics_Icon,
        name: "Athletics",
        isProficient: true,
        modifier: "+6",
      },
    ],
  },
  {
    attribute: "Dexterity (+1)",
    skills: [
      {
        icon: Acrobatics_Icon,
        name: "Acrobatics",
        isProficient: false,
        modifier: "+1",
      },
      {
        icon: Stealth_Icon,
        name: "Stealth",
        isProficient: false,
        modifier: "+1",
      },
      {
        icon: Sleight_of_Hand_Icon,
        name: "Sleight of Hand",
        isProficient: false,
        modifier: "+1",
      },
    ],
  },
  {
    attribute: "Intelligence (-1)",
    skills: [
      {
        icon: Investigation_Icon,
        name: "Investigation",
        isProficient: false,
        modifier: "-1",
      },
      {
        icon: History_Icon,
        name: "History",
        isProficient: false,
        modifier: "-1",
      },
      {
        icon: Arcana_Icon,
        name: "Arcana",
        isProficient: false,
        modifier: "-1",
      },
      {
        icon: Nature_Icon,
        name: "Nature",
        isProficient: false,
        modifier: "-1",
      },
      {
        icon: Religion_Icon,
        name: "Religion",
        isProficient: false,
        modifier: "-1",
      },
    ],
  },
  {
    attribute: "Wisdom (0)",
    skills: [
      {
        icon: Animal_Handling_Icon,
        name: "Animal Handling",
        isProficient: false,
        modifier: "0",
      },
      {
        icon: Insight_Icon,
        name: "Insight",
        isProficient: true,
        modifier: "+3",
      },
      {
        icon: Medicine_Icon,
        name: "Medicine",
        isProficient: false,
        modifier: "0",
      },
      {
        icon: Perception_Icon,
        name: "Perception",
        isProficient: true,
        modifier: "+3",
      },
      {
        icon: Survival_Icon,
        name: "Survival",
        isProficient: false,
        modifier: "0",
      },
    ],
  },
  {
    attribute: "Charisma (+2)",
    skills: [
      {
        icon: Performance_Icon,
        name: "Performance",
        isProficient: true,
        modifier: "+5",
      },
      {
        icon: Deception_Icon,
        name: "Deception",
        isProficient: true,
        modifier: "+5",
      },
      {
        icon: Intimidation_Icon,
        name: "Intimidation",
        isProficient: false,
        modifier: "+2",
      },
      {
        icon: Persuasion_Icon,
        name: "Persuasion",
        isProficient: true,
        modifier: "+5",
      },
    ],
  },
];

const detailedIdentityRows = [
  { label: "Hit Points", value: "142 / 142" },
  { label: "Temporary Hit Points", value: "3 / 3" },
  { label: "Armour Class", value: "21" },
  {
    label: "Class",
    value: "Lv 6 Paladin",
    detail: "Oath of Vengeance",
  },
  {
    label: "Class",
    value: "Lv 6 Sorcerer",
    detail: "Draconic Bloodline",
  },
  { label: "Race", value: "Wood Half-Elf" },
  { label: "Background", value: "Soldier" },
];

const detailedAttributeRows = [
  { label: "Initiative", value: "+4" },
  { label: "Movement Speed", value: "14m" },
  { label: "Darkvision Range", value: "12m" },
  { label: "Type", value: "Humanoid" },
  { label: "Size", value: "Large" },
  { label: "Weight", value: "205kg" },
  { label: "Carrying Capacity", value: "300kg" },
];

const detailedProficiencyRows = [
  { count: "x4", label: "Armour" },
  { count: "x12", label: "Simple Weapons" },
  { count: "x19", label: "Martial Weapons" },
  { count: "OK", label: "Musical Instrument" },
];

const savingThrowBonuses = [
  { ability: "STR", bonus: "+13" },
  { ability: "DEX", bonus: "+13" },
  { ability: "CON", bonus: "+14" },
  { ability: "INT", bonus: "+7" },
  { ability: "WIS", bonus: "+15" },
  { ability: "CHA", bonus: "+17" },
];

const detailedTags = ["Humanoid", "Melee", "Frontline", "Paladin", "Sorcerer"];

const renderDivider = (title) => (
  <h3 className="v2-detailed-divider">
    <img src={Left_Curlicue_Icon} alt="" aria-hidden="true" />
    <span>{title}</span>
    <img src={Right_Curlicue_Icon} alt="" aria-hidden="true" />
  </h3>
);

const V2ProficienciesPanel = () => {
  const [viewMode, setViewMode] = useState("scroll");

  const isScrollView = viewMode === "scroll";

  return (
    <article className="v2-overview-panel v2-proficiencies-panel">
      <header className="v2-overview-panel-header v2-proficiencies-header">
        <div className="v2-proficiencies-heading-group">
          <h2>{isScrollView ? "Proficiencies" : "Detailed View"}</h2>
          {isScrollView && (
            <p className="v2-proficiency-bonus">
              <img src={Gold_Star_Icon} alt="Proficiency" />
              +3 Bonus
            </p>
          )}
        </div>

        <div
          className="v2-proficiency-view-toggle"
          role="tablist"
          aria-label="Proficiency panel mode"
        >
          <button
            type="button"
            className={isScrollView ? "is-active" : ""}
            role="tab"
            aria-selected={isScrollView}
            onClick={() => setViewMode("scroll")}
          >
            Scroll
          </button>
          <button
            type="button"
            className={!isScrollView ? "is-active" : ""}
            role="tab"
            aria-selected={!isScrollView}
            onClick={() => setViewMode("detailed")}
          >
            Detailed
          </button>
        </div>
      </header>

      {isScrollView ? (
        <div className="v2-proficiencies-scroll">
          {proficienciesData.map((group) => (
            <section key={group.attribute} className="v2-proficiency-group">
              <h3>{group.attribute}</h3>
              <ul>
                {group.skills.map((skill) => (
                  <li key={skill.name} className="v2-proficiency-row">
                    <div className="v2-proficiency-skill">
                      <img src={skill.icon} alt={skill.name} />
                      <span>{skill.name}</span>
                    </div>
                    <div className="v2-proficiency-modifier">
                      {skill.isProficient && (
                        <img src={Gold_Star_Icon} alt="Proficient" />
                      )}
                      <span>{skill.modifier}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="v2-proficiencies-detailed">
          <section className="v2-detailed-card">
            {detailedIdentityRows.map((row, index) => (
              <div className="v2-detailed-row" key={`${row.label}-${index}`}>
                <p className="v2-detailed-label">{row.label}</p>
                <div className="v2-detailed-value-block">
                  <p className="v2-detailed-value">{row.value}</p>
                  {row.detail && (
                    <p className="v2-detailed-note">{row.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </section>

          {renderDivider("Attributes")}

          <section className="v2-detailed-card">
            {detailedAttributeRows.map((row) => (
              <div className="v2-detailed-row" key={row.label}>
                <p className="v2-detailed-label">{row.label}</p>
                <p className="v2-detailed-value">{row.value}</p>
              </div>
            ))}
          </section>

          {renderDivider("Proficiency Bonus (+4)")}

          <section className="v2-detailed-card v2-proficiency-summary-list">
            {detailedProficiencyRows.map((row) => (
              <div className="v2-proficiency-summary-row" key={row.label}>
                <span className="v2-proficiency-summary-count">
                  {row.count}
                </span>
                <span className="v2-proficiency-summary-label">
                  {row.label}
                </span>
              </div>
            ))}
          </section>

          {renderDivider("Saving Throw Bonus")}

          <section className="v2-saving-throws-grid">
            {savingThrowBonuses.map((save) => (
              <div className="v2-saving-throw-chip" key={save.ability}>
                <span>{save.ability}</span>
                <strong>{save.bonus}</strong>
              </div>
            ))}
          </section>

          {renderDivider("Tags")}

          <section className="v2-detailed-tags">
            {detailedTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </section>
        </div>
      )}
    </article>
  );
};

export default V2ProficienciesPanel;
