import { useMemo, useRef, useState } from "react";
import Popup from "./Popup";
import { formulaRange, substituteTokens } from "../../data/formulas";
import ActionIcon from "../../../assets/resources/action.png";
import BonusActionIcon from "../../../assets/resources/bonus_action.png";
import ReactionIcon from "../../../assets/resources/reaction.png";
import SpellSlotIcon from "../../../assets/resources/spell_slot.png";
import RitualIcon from "../../../assets/resources/ritual.png";
import ChannelDivinityIcon from "../../../assets/resources/channel_oath.png";
import D8Radiant from "../../../assets/popups/dice/D8_Radiant.png";
import D8Thunder from "../../../assets/popups/dice/D8_Thunder.png";
import D8Fire from "../../../assets/popups/dice/D8_Fire.png";
import D8Psychic from "../../../assets/popups/dice/D8_Psychic.png";
import D6Thunder from "../../../assets/popups/dice/D6_Thunder.png";
import D6Fire from "../../../assets/popups/dice/D6_Fire.png";
import D6Psychic from "../../../assets/popups/dice/D6_Psychic.png";
import D6Radiant from "../../../assets/popups/dice/D6_Radiant.png";
import D10Fire from "../../../assets/popups/dice/D10_Fire.png";
import D10Necrotic from "../../../assets/popups/dice/D10_Necrotic.png";
import SlashingIcon from "../../../assets/popups/damage/Slashing_Damage_Icon.png";
import RadiantIcon from "../../../assets/popups/damage/Radiant_Damage_Icon.png";
import FireIcon from "../../../assets/popups/damage/Fire_Damage_Icon.png";
import ThunderIcon from "../../../assets/popups/damage/Thunder_Damage_Icon.png";
import PsychicIcon from "../../../assets/popups/damage/Psychic_Damage_Icon.png";
import NecroticIcon from "../../../assets/popups/damage/Necrotic_Damage_Icon.png";
import PiercingIcon from "../../../assets/popups/damage/Piercing_Damage_Icon.png";
import MeleeIcon from "../../../assets/popups/mechanics/Melee_Range_Icon.png";
import RangedIcon from "../../../assets/popups/mechanics/Range_Icon.png";
import AttackRollIcon from "../../../assets/popups/mechanics/Attack_Roll_Icon.png";
import SavingThrowIcon from "../../../assets/popups/mechanics/Saving_Throw_Icon.png";
import AoeIcon from "../../../assets/popups/mechanics/Aoe_Icon.png";
import ConcentrationIcon from "../../../assets/popups/Duration_Icon.png";

import "../../styles/components/popups/spell-hover-popup.scss";

const POPUP_CHROME_ASSETS = [
  ActionIcon,
  BonusActionIcon,
  ReactionIcon,
  SpellSlotIcon,
  RitualIcon,
  ChannelDivinityIcon,
  D8Radiant,
  D8Thunder,
  D8Fire,
  D8Psychic,
  D6Thunder,
  D6Fire,
  D6Psychic,
  D6Radiant,
  D10Fire,
  D10Necrotic,
  SlashingIcon,
  RadiantIcon,
  FireIcon,
  ThunderIcon,
  PsychicIcon,
  NecroticIcon,
  PiercingIcon,
  MeleeIcon,
  RangedIcon,
  AttackRollIcon,
  SavingThrowIcon,
  AoeIcon,
  ConcentrationIcon,
];

if (typeof window !== "undefined" && typeof Image !== "undefined") {
  const preload = () => {
    for (const url of POPUP_CHROME_ASSETS) {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
    }
  };

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(preload, { timeout: 1500 });
  } else {
    setTimeout(preload, 0);
  }
}

const KIND_ICONS = {
  action: ActionIcon,
  bonus: BonusActionIcon,
  reaction: ReactionIcon,
  utility: ActionIcon,
};

const DAMAGE_TYPE_ICONS = {
  slashing: SlashingIcon,
  radiant: RadiantIcon,
  fire: FireIcon,
  thunder: ThunderIcon,
  psychic: PsychicIcon,
  necrotic: NecroticIcon,
  piercing: PiercingIcon,
};

const MECHANIC_ICONS = {
  melee: MeleeIcon,
  ranged: RangedIcon,
  "attack-roll": AttackRollIcon,
  save: SavingThrowIcon,
  aoe: AoeIcon,
  range: RangedIcon,
  concentration: ConcentrationIcon,
};

const DICE_ICONS = {
  "d6-thunder": D6Thunder,
  "d6-fire": D6Fire,
  "d6-psychic": D6Psychic,
  "d6-radiant": D6Radiant,
  "d8-radiant": D8Radiant,
  "d8-thunder": D8Thunder,
  "d8-fire": D8Fire,
  "d8-psychic": D8Psychic,
  "d10-fire": D10Fire,
  "d10-necrotic": D10Necrotic,
};

const pickDiceIcon = (damageRows) => {
  if (!damageRows || damageRows.length === 0) {
    return D8Radiant;
  }

  const lastRow = damageRows[damageRows.length - 1];
  const match = /d(\d+)/.exec(lastRow.formula ?? "");

  if (!match) {
    return D8Radiant;
  }

  const dieSize = match[1];
  const type = lastRow.icon ?? "radiant";

  return DICE_ICONS[`d${dieSize}-${type}`] ?? D8Radiant;
};

const TIER_LABELS = {
  C: "Cantrip",
  I: "Level 1",
  II: "Level 2",
  III: "Level 3",
  IV: "Level 4",
  V: "Level 5",
};

const KIND_LABELS = {
  action: "Action",
  bonus: "Bonus Action",
  reaction: "Reaction",
  utility: "Action",
};

const SpellHoverPopup = ({
  spell,
  children,
  positionPreference = "horizontal",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const triggerRef = useRef(null);

  const isSpell = spell?.class !== "common";
  const tierLabel = TIER_LABELS[spell?.tier] ?? "Spell";
  const kindLabel = KIND_LABELS[spell?.kind] ?? "Action";
  const tierSubtitle =
    spell?.subtitle ??
    (spell?.tier === "C"
      ? "Cantrip Spell"
      : `${tierLabel} ${spell?.school ?? "Spell"}`);

  const summaryText =
    spell?.description ??
    (isSpell
      ? "A prepared spell available for quick casting from your action bar."
      : null);

  const slotTag = useMemo(() => {
    if (spell?.tier === "C") {
      return "Cantrip";
    }

    return `${tierLabel} Spell Slot`;
  }, [spell?.tier, tierLabel]);

  const hasMetaSegment = Boolean(
    spell?.range || spell?.area || spell?.saveAbility,
  );
  const kindModifier = `is-kind-${spell?.kind ?? "action"}`;
  const slotModifier = spell?.tier === "C" ? "is-cantrip" : "is-slot";
  const kindIcon = KIND_ICONS[spell?.kind] ?? KIND_ICONS.action;
  const rawDamageRows = Array.isArray(spell?.damageRows) ? spell.damageRows : [];
  const damageRows = useMemo(
    () =>
      rawDamageRows.map((row) => ({
        ...row,
        formula: substituteTokens(row.formula ?? ""),
      })),
    [rawDamageRows],
  );
  const computedDamageHeadline = useMemo(() => {
    if (damageRows.length === 0) {
      return null;
    }

    const { min, max } = damageRows.reduce(
      (totals, row) => {
        const range = formulaRange(row.formula);
        return {
          min: totals.min + range.min,
          max: totals.max + range.max,
        };
      },
      { min: 0, max: 0 },
    );

    if (min === 0 && max === 0) {
      return null;
    }

    return min === max ? `${min} Damage` : `${min}~${max} Damage`;
  }, [damageRows]);
  const damageHeadline = computedDamageHeadline ?? spell?.damageHeadline ?? null;
  const mechanics = Array.isArray(spell?.mechanics) ? spell.mechanics : [];
  const popupArt = spell?.popupIcon ?? spell?.icon ?? null;
  const diceIcon = pickDiceIcon(damageRows);

  return (
    <div
      className="spell-hover-popup-trigger"
      ref={triggerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragStart={() => {
        setIsHovered(false);
        setIsPinned(false);
      }}
    >
      {children}

      {(isHovered || isPinned) && (
        <Popup
          triggerRef={triggerRef}
          positionPreference={positionPreference}
          onPinChange={setIsPinned}
        >
          <div
            className={
              popupArt
                ? "spell-hover-popup-content has-art"
                : "spell-hover-popup-content"
            }
          >
            {popupArt && (
              <div className="spell-hover-popup-art-overflow" aria-hidden="true">
                <img src={popupArt} alt="" />
              </div>
            )}

            <div className="spell-hover-popup-header">
              <div className="spell-hover-popup-title-block">
                <h5 className="popup-title">{spell?.name ?? "Spell"}</h5>
                <p className="popup-subtitle">{tierSubtitle}</p>
                {damageHeadline && (
                  <p className="spell-hover-popup-damage-headline">
                    {damageHeadline}
                  </p>
                )}
              </div>

              {!popupArt && (
                <div className="spell-hover-popup-art-fallback" aria-hidden="true">
                  <span>
                    {spell?.fallbackIconText ?? spell?.short ?? "SP"}
                  </span>
                </div>
              )}
            </div>

            {damageRows.length > 0 && (
              <div className="spell-hover-popup-damage-grid">
                <div
                  className="spell-hover-popup-damage-dice"
                  aria-hidden="true"
                >
                  <img src={diceIcon} alt="" draggable={false} />
                </div>
                <div className="spell-hover-popup-damage-list">
                  {damageRows.map((row, index) => {
                    const typeIcon = DAMAGE_TYPE_ICONS[row.icon];
                    const typeClass = row.icon
                      ? `is-type-${row.icon}`
                      : "";

                    return (
                      <p
                        key={`${row.formula}-${row.type}-${index}`}
                        className={`spell-hover-popup-damage-row ${typeClass}`.trim()}
                      >
                        <span className="spell-hover-popup-damage-formula">
                          {row.formula}
                        </span>
                        {typeIcon && (
                          <img
                            className="spell-hover-popup-damage-type-icon"
                            src={typeIcon}
                            alt=""
                            aria-hidden="true"
                            draggable={false}
                          />
                        )}
                        <span className="spell-hover-popup-damage-type">
                          {row.type}
                        </span>
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

            {summaryText && (
              <p className="popup-description">{summaryText}</p>
            )}

            {spell?.onSave && (
              <p className="spell-hover-popup-on-save">
                On Save: {spell.onSave}
              </p>
            )}

            {mechanics.length > 0 && (
              <p className="spell-hover-popup-mechanics">
                {mechanics.map((mechanic, index) => {
                  const icon = MECHANIC_ICONS[mechanic.icon];

                  return (
                    <span
                      key={`${mechanic.label}-${index}`}
                      className="spell-hover-popup-mechanic"
                    >
                      {icon && (
                        <img
                          className="spell-hover-popup-mechanic-icon"
                          src={icon}
                          alt=""
                          aria-hidden="true"
                          draggable={false}
                        />
                      )}
                      {mechanic.label}
                    </span>
                  );
                })}
              </p>
            )}

            {hasMetaSegment && (
              <div className="spell-hover-popup-meta">
                {spell?.range && <span>{spell.range}</span>}
                {spell?.area && <span>{spell.area}</span>}
                {spell?.saveAbility && <span>{spell.saveAbility} Save</span>}
              </div>
            )}

            <div className="spell-hover-popup-footer-tags">
              <span className={kindModifier}>
                <img
                  className="spell-hover-popup-tag-icon"
                  src={kindIcon}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                />
                {kindLabel}
              </span>
              {spell?.channelDivinity && (
                <span className="is-channel-divinity">
                  <img
                    className="spell-hover-popup-tag-icon"
                    src={ChannelDivinityIcon}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                  />
                  Channel Divinity
                </span>
              )}
              {spell?.ritual && (
                <span className="is-ritual">
                  <img
                    className="spell-hover-popup-tag-icon"
                    src={RitualIcon}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                  />
                  Ritual
                </span>
              )}
              {isSpell && (
                <span className={slotModifier}>
                  <img
                    className="spell-hover-popup-tag-icon"
                    src={SpellSlotIcon}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                  />
                  {slotTag}
                </span>
              )}
            </div>
          </div>
        </Popup>
      )}
    </div>
  );
};

export default SpellHoverPopup;
