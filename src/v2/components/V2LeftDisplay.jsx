import { useMemo, useState } from "react";
import "../styles/components/v2-left-display.scss";
import Sariel_PFP from "../../assets/layout/left_display/sariel_pfp.png";
import Vengeance_Paladin_Icon from "../../assets/layout/left_display/Class_Paladin_Badge_Icon.png";
import AC_Icon from "../../assets/layout/left_display/AC_Icon.png";
import Gold_Icon from "../../assets/layout/left_display/gold_icon.png";

import Star_Icon from "../../assets/layout/left_display/Gold_Star_Icon.png";
import Dice_Icon from "../../assets/layout/left_display/Ability_Score_Proficiency_Icon.png";

import resistanceData from "../../data/resistanceData";

import Left_Curlicue_Icon from "../../assets/layout/left_display/gold_curl_curlicue_left.svg";
import Right_Curlicue_Icon from "../../assets/layout/left_display/gold_curl_curlicue_right.svg";

import AbilityScorePopup from "./popups/AbilityScorePopup";
import FeaturePopup from "./popups/FeaturePopup";
import ConditionPopup from "./popups/ConditionPopup";
import InformationPopup from "./popups/InformationPopup";
import ResistancePopup from "./popups/ResistancePopup";

import abilityScoresData from "../../data/abilityScoresData";
import featuresData from "../../data/featuresData";
import {
  CONDITIONS,
  getActiveAbilityScoreSources,
  getActiveSavingThrowSources,
  resolveConditionText,
  sumAcBonus,
} from "../data/conditionsCatalog";
import { useConditions } from "../state/ConditionsContext";
import { useCharacterStats } from "../state/CharacterStatsContext";

const BASE_AC = 18;

const formatBonus = (value) => (value >= 0 ? `+${value}` : `${value}`);

const V2LeftDisplay = () => {
  const { activeConditions, applyCondition, removeCondition } = useConditions();
  const {
    baseScores,
    modifiers,
    abilityScoreModifiers,
    proficiencyBonus,
    adjustBaseScore,
  } = useCharacterStats();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const displayedAc = BASE_AC + sumAcBonus(activeConditions);
  const savingThrowSources = getActiveSavingThrowSources(activeConditions, {
    modifiers,
  });

  const augmentSavingThrows = (savingThrows) => {
    if (!Array.isArray(savingThrows) || savingThrowSources.length === 0) {
      return savingThrows ?? [];
    }

    return [
      ...savingThrows,
      ...savingThrowSources.map(
        (source) => `${source.title}, ${formatBonus(source.bonus)}`,
      ),
    ];
  };

  const buildAttributeRow = (attr) => {
    const ability = attr.label;
    const base = baseScores[ability] ?? attr.value;
    const delta = abilityScoreModifiers[ability] ?? 0;
    const effective = base + delta;
    const modifier = modifiers[ability] ?? 0;
    const saveBonus = modifier + (attr.isProficient ? proficiencyBonus : 0);
    const savingThrows = [`${attr.title}, ${formatBonus(saveBonus)}`];
    const conditionSources = getActiveAbilityScoreSources(
      activeConditions,
      ability,
    ).map(
      (source) =>
        `**${source.delta > 0 ? "+" : ""}${source.delta}** from ${source.title}`,
    );
    const sources = [...attr.sources, ...conditionSources];

    return {
      ...attr,
      base,
      delta,
      value: effective,
      savingThrows,
      sources,
    };
  };

  const attributeRows = abilityScoresData.map(buildAttributeRow);

  const conditionEntries = activeConditions
    .map((entry) => {
      const definition = CONDITIONS[entry.id];

      if (!definition) {
        return null;
      }

      const text = resolveConditionText(definition, { modifiers });

      return { ...definition, text, remainingTurns: entry.remainingTurns };
    })
    .filter(Boolean);

  const activeIds = useMemo(
    () => new Set(activeConditions.map((entry) => entry.id)),
    [activeConditions],
  );

  const availableConditions = useMemo(
    () =>
      Object.values(CONDITIONS).filter(
        (condition) => !condition.permanent && !activeIds.has(condition.id),
      ),
    [activeIds],
  );

  const handleApplyFromPicker = (id) => {
    applyCondition(id, Number.POSITIVE_INFINITY);
    setIsPickerOpen(false);
  };

  return (
    <div className="left-display-content">
      <div className="left-display-header shared-margin">
        <h5 className="character-name">Sariel Hewlett</h5>
        <div className="currency">
          <p>860</p>
          <img src={Gold_Icon} alt="GP" className="currency-icon" />
        </div>
      </div>
      <div className="image-container shared-margin">
        <img src={Sariel_PFP} alt="Character" className="character-image" />
      </div>
      <div className="image-container shared-margin">
        <img src={AC_Icon} alt="AC" className="overlay-image" />
        <p className="overlay-text">{displayedAc}</p>
      </div>
      <InformationPopup
        title="Wood Half-Elf"
        subtitle="Like their wood elf parent, these half-elves have a quickened stride and an eye for stealth. Yet many break away from isolation in Veraltia's forests to explore the rest of the Realm."
      >
        <p className="race shared-margin">Wood Half-Elf</p>
      </InformationPopup>
      <div className="image-container shared-margin">
        <img
          src={Vengeance_Paladin_Icon}
          alt="Paladin"
          className="class-image"
        />
      </div>
      <div className="class-info shared-margin">
        <InformationPopup
          title="Paladin (Oath of Vengeance)"
          subtitle="A promise made so deeply that it becomes divine in itself flows through a Paladin, burning bright enough to inspire allies and smite foes."
        >
          <p className="class-level">Level 6 Paladin</p>
        </InformationPopup>
        <span className="class-separator"> / </span>
        <InformationPopup
          title="Sorcerer (Divine Soul)"
          subtitle="Divine Soul sorcerers channel innate divine magic, blending sorcerous power with the cleric spell list and a destiny guarded by the gods."
        >
          <p className="class-level">Level 3 Sorcerer</p>
        </InformationPopup>
      </div>
      <div className="attributes">
        {attributeRows.map((attr, index) => (
          <div key={index} className="attribute-wrapper">
            {attr.isPrimary && (
              <InformationPopup
                title="Primary Ability"
                subtitle="This is your primary ability."
              >
                <div className="primary-icon-container">
                  <img
                    src={Star_Icon}
                    alt="Primary Ability"
                    className="primary-icon"
                  />
                </div>
              </InformationPopup>
            )}
            <AbilityScorePopup
              icon={attr.icon}
              title={attr.title}
              subtitle="Ability"
              text={attr.description}
              value={attr.value}
              baseValue={attr.base}
              modifierDelta={attr.delta}
              onAdjust={(step) => adjustBaseScore(attr.label, step)}
              isPrimary={attr.isPrimary}
              isProficient={attr.isProficient}
              savingThrows={augmentSavingThrows(attr.savingThrows)}
              sources={attr.sources}
            >
              <div className="attribute">
                <p>{attr.label}</p>
                <div className="attribute-value-container">
                  {attr.isProficient && (
                    <img
                      src={Dice_Icon}
                      alt="Proficient Ability"
                      className="proficient-icon"
                    />
                  )}
                  <p className="attribute-value">{attr.value}</p>
                </div>
              </div>
            </AbilityScorePopup>
          </div>
        ))}
      </div>

      <p className="shared-margin subheading">
        <img
          src={Left_Curlicue_Icon}
          alt="Left Curlicue"
          className="curlicue"
        />
        Conditions
        <img
          src={Right_Curlicue_Icon}
          alt="Right Curlicue"
          className="curlicue"
        />
      </p>

      <div className="conditions shared-margin">
        {conditionEntries.length === 0 && (
          <p className="conditions-empty">No active conditions.</p>
        )}
        {conditionEntries.map((condition) => {
          const isPermanent = !!condition.permanent;
          const isUntilRemoved =
            !isPermanent && !Number.isFinite(condition.remainingTurns);
          let durationLabel;
          if (isPermanent) {
            durationLabel = "Always active";
          } else if (isUntilRemoved) {
            durationLabel = "Until removed";
          } else {
            durationLabel = `${condition.remainingTurns} turn${condition.remainingTurns === 1 ? "" : "s"} remaining`;
          }

          return (
            <ConditionPopup
              key={condition.id}
              icon={condition.icon}
              title={condition.title}
              subtitle={condition.subtitle}
              text={condition.text}
              duration={durationLabel}
            >
              <div
                className="condition-content"
                onContextMenu={(event) => {
                  if (isPermanent) {
                    return;
                  }
                  event.preventDefault();
                  removeCondition(condition.id);
                }}
                title={isPermanent ? "Always active" : "Right-click to remove"}
              >
                <div className="condition-image-container">
                  <img
                    src={condition.icon}
                    alt={condition.title}
                    className="condition-icon"
                  />
                  <p className="condition-duration">
                    {isPermanent || isUntilRemoved
                      ? "∞"
                      : condition.remainingTurns}
                  </p>
                </div>
                <p>{condition.title}</p>
              </div>
            </ConditionPopup>
          );
        })}

        {availableConditions.length > 0 && (
          <div className="condition-picker">
            <button
              type="button"
              className="condition-picker-toggle"
              onClick={() => setIsPickerOpen((open) => !open)}
            >
              {isPickerOpen ? "− Cancel" : "+ Apply condition"}
            </button>
            {isPickerOpen && (
              <ul className="condition-picker-list">
                {availableConditions.map((condition) => (
                  <li key={condition.id}>
                    <button
                      type="button"
                      className="condition-picker-item"
                      onClick={() => handleApplyFromPicker(condition.id)}
                    >
                      <img
                        src={condition.icon}
                        alt=""
                        className="condition-picker-icon"
                        aria-hidden="true"
                      />
                      <span>{condition.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <p className="shared-margin subheading">
        <img
          src={Left_Curlicue_Icon}
          alt="Left Curlicue"
          className="curlicue"
        />
        Resistances
        <img
          src={Right_Curlicue_Icon}
          alt="Right Curlicue"
          className="curlicue"
        />
      </p>
      <div className="resistances shared-margin-small">
        {resistanceData.map((resistance) => (
          <ResistancePopup
            key={resistance.id}
            title={resistance.title}
            rules={resistance.rules}
            positionPreference="vertical"
          >
            <img
              src={resistance.icon}
              alt={resistance.label}
              className="resistance-icon"
            />
          </ResistancePopup>
        ))}
      </div>

      <p className="shared-margin subheading">
        <img
          src={Left_Curlicue_Icon}
          alt="Left Curlicue"
          className="curlicue"
        />
        Notable Features
        <img
          src={Right_Curlicue_Icon}
          alt="Right Curlicue"
          className="curlicue"
        />
      </p>
      <div className="features shared-margin">
        {featuresData.map((feature, index) => (
          <FeaturePopup
            key={index}
            icon={feature.icon}
            title={feature.title}
            subtitle={feature.subtitle}
            text={feature.text}
          >
            <div className="feature-content">
              <img
                src={feature.icon}
                alt={feature.title}
                className="hover-icon"
              />
              <p>{feature.title}</p>
            </div>
          </FeaturePopup>
        ))}
      </div>
    </div>
  );
};

export default V2LeftDisplay;
