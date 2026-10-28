import { useState } from "react";
import Acrobatics_Icon from "@/assets/skills/Acrobatics_Icon.png";
import Animal_Handling_Icon from "@/assets/skills/Animal_Handling_Icon.png";
import Arcana_Icon from "@/assets/skills/Arcana_Icon.png";
import Athletics_Icon from "@/assets/skills/Athletics_Icon.png";
import Deception_Icon from "@/assets/skills/Deception_Icon.png";
import History_Icon from "@/assets/skills/History_Icon.png";
import Insight_Icon from "@/assets/skills/Insight_Icon.png";
import Intimidation_Icon from "@/assets/skills/Intimidation_Icon.png";
import Investigation_Icon from "@/assets/skills/Investigation_Icon.png";
import Medicine_Icon from "@/assets/skills/Medicine_Icon.png";
import Nature_Icon from "@/assets/skills/Nature_Icon.png";
import Perception_Icon from "@/assets/skills/Perception_Icon.png";
import Performance_Icon from "@/assets/skills/Performance_Icon.png";
import Persuasion_Icon from "@/assets/skills/Persuasion_Icon.png";
import Religion_Icon from "@/assets/skills/Religion_Icon.png";
import Stealth_Icon from "@/assets/skills/Stealth_Icon.png";
import Sleight_of_Hand_Icon from "@/assets/skills/Sleight_of_Hand_Icon.png";
import Survival_Icon from "@/assets/skills/Survival_Icon.png";
import Gold_Star_Icon from "@/assets/layout/left_display/Gold_Star_Icon.png";
import Left_Curlicue_Icon from "@/assets/layout/left_display/gold_curl_curlicue_left.svg";
import Right_Curlicue_Icon from "@/assets/layout/left_display/gold_curl_curlicue_right.svg";
import AbilityScorePopup from "@/components/popups/AbilityScorePopup";
import SkillPopup from "@/components/popups/SkillPopup";
import abilityScoresData from "@/data/character/abilityScores";
import skillsData from "@/data/character/skills";

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
    attribute: "Dexterity (+2)",
    skills: [
      {
        icon: Acrobatics_Icon,
        name: "Acrobatics",
        isProficient: false,
        modifier: "+2",
      },
      {
        icon: Stealth_Icon,
        name: "Stealth",
        isProficient: false,
        modifier: "+2",
      },
      {
        icon: Sleight_of_Hand_Icon,
        name: "Sleight of Hand",
        isProficient: false,
        modifier: "+2",
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
        isProficient: false,
        modifier: "+2",
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
        isProficient: true,
        modifier: "+5",
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
  { label: "Hit Points", value: "61 / 61" },
  { label: "Armour Class", value: "18" },
  {
    label: "Class",
    value: "Lv 6 Paladin",
    detail: "Oath of Vengeance",
  },
  {
    label: "Class",
    value: "Lv 3 Sorcerer",
    detail: "Divine Soul",
  },
  { label: "Race", value: "Wood Half-Elf" },
  { label: "Background", value: "Soldier" },
];

const detailedAttributeRows = [
  { label: "Initiative", value: "+2" },
  { label: "Movement Speed", value: "35ft" },
  { label: "Darkvision Range", value: "60ft" },
  { label: "Type", value: "Humanoid" },
  { label: "Size", value: "Medium" },
  { label: "Weight", value: "75kg" },
  { label: "Carrying Capacity", value: "240lb" },
];

const detailedProficiencyRows = [
  { count: "x4", label: "Armour" },
  { count: "ALL", label: "Simple Weapons" },
  { count: "ALL", label: "Martial Weapons" },
  { count: "OK", label: "Deck of Cards" },
];

const savingThrowBonuses = [
  { ability: "STR", bonus: "+3" },
  { ability: "DEX", bonus: "+2" },
  { ability: "CON", bonus: "+1" },
  { ability: "INT", bonus: "-1" },
  { ability: "WIS", bonus: "+3" },
  { ability: "CHA", bonus: "+5" },
];

const detailedTags = [
  "Humanoid",
  "Melee",
  "Frontline",
  "Paladin",
  "Sorcerer",
  "Oath of Vengeance",
  "Divine Soul",
];

const renderDivider = (title) => (
  <h3 className="detailed-divider">
    <img src={Left_Curlicue_Icon} alt="" aria-hidden="true" />
    <span>{title}</span>
    <img src={Right_Curlicue_Icon} alt="" aria-hidden="true" />
  </h3>
);

const ProficienciesPanel = () => {
  const [viewMode, setViewMode] = useState("scroll");

  const isScrollView = viewMode === "scroll";

  return (
    <article className="overview-panel proficiencies-panel">
      <header className="overview-panel-header proficiencies-header">
        <div className="proficiencies-heading-group">
          <h2>{isScrollView ? "Proficiencies" : "Character"}</h2>
        </div>

        <div
          className="proficiency-view-toggle"
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
            Proficiencies
          </button>
          <button
            type="button"
            className={!isScrollView ? "is-active" : ""}
            role="tab"
            aria-selected={!isScrollView}
            onClick={() => setViewMode("detailed")}
          >
            Character
          </button>
        </div>
      </header>

      {isScrollView && (
        <p className="proficiency-bonus">
          <img src={Gold_Star_Icon} alt="Proficiency" />
          Proficiency Bonus (+3)
        </p>
      )}

      {isScrollView ? (
        <div className="proficiencies-scroll">
          {proficienciesData.map((group) => (
            <section key={group.attribute} className="proficiency-group">
              <h3>{group.attribute}</h3>
              <ul>
                {group.skills.map((skill) => {
                  const meta = skillsData[skill.name] || {};
                  return (
                    <SkillPopup
                      key={skill.name}
                      as="li"
                      className="proficiency-row"
                      name={skill.name}
                      ability={meta.ability}
                      modifier={skill.modifier}
                      description={meta.description}
                      effect={meta.effect}
                    >
                      <div className="proficiency-skill">
                        <img src={skill.icon} alt={skill.name} />
                        <span>{skill.name}</span>
                      </div>
                      <div className="proficiency-modifier">
                        {skill.isProficient && (
                          <img src={Gold_Star_Icon} alt="Proficient" />
                        )}
                        <span>{skill.modifier}</span>
                      </div>
                    </SkillPopup>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="proficiencies-detailed">
          <section className="detailed-card">
            {detailedIdentityRows.map((row, index) => (
              <div className="detailed-row" key={`${row.label}-${index}`}>
                <p className="detailed-label">{row.label}</p>
                <div className="detailed-value-block">
                  <p className="detailed-value">{row.value}</p>
                  {row.detail && <p className="detailed-note">{row.detail}</p>}
                </div>
              </div>
            ))}
          </section>

          {renderDivider("Attributes")}

          <section className="detailed-card">
            {detailedAttributeRows.map((row) => (
              <div className="detailed-row" key={row.label}>
                <p className="detailed-label">{row.label}</p>
                <p className="detailed-value">{row.value}</p>
              </div>
            ))}
          </section>

          {renderDivider("Proficiency Bonus (+3)")}

          <section className="detailed-card proficiency-summary-list">
            {detailedProficiencyRows.map((row) => (
              <div className="proficiency-summary-row" key={row.label}>
                <span className="proficiency-summary-count">{row.count}</span>
                <span className="proficiency-summary-label">{row.label}</span>
              </div>
            ))}
          </section>

          {renderDivider("Saving Throw Bonus")}

          <section className="saving-throws-grid">
            {savingThrowBonuses.map((save) => {
              const ability = abilityScoresData.find(
                (entry) => entry.label === save.ability,
              );
              const chip = (
                <div className="saving-throw-chip">
                  <span>{save.ability}</span>
                  <strong>{save.bonus}</strong>
                </div>
              );

              if (!ability) {
                return (
                  <div className="saving-throw-chip" key={save.ability}>
                    <span>{save.ability}</span>
                    <strong>{save.bonus}</strong>
                  </div>
                );
              }

              return (
                <AbilityScorePopup
                  key={save.ability}
                  icon={ability.icon}
                  title={ability.title}
                  subtitle="Ability"
                  text={ability.description}
                  value={ability.value}
                  savingThrows={ability.savingThrows}
                  sources={ability.sources}
                >
                  {chip}
                </AbilityScorePopup>
              );
            })}
          </section>

          {renderDivider("Tags")}

          <section className="detailed-tags">
            {detailedTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </section>
        </div>
      )}
    </article>
  );
};

export default ProficienciesPanel;
