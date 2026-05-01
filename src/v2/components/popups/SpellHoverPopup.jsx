import { useMemo, useRef, useState } from "react";
import Popup from "./Popup";
import ActionIcon from "../../../assets/resources/action.png";
import BonusActionIcon from "../../../assets/resources/bonus_action.png";
import ReactionIcon from "../../../assets/resources/reaction.png";
import SpellSlotIcon from "../../../assets/resources/spell_slot.png";
import DiceIcon from "../../../assets/popups/dice/D8_Radiant.png";
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

import "../../styles/components/popups/spell-hover-popup.scss";

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
  utility: "Utility",
};

const SpellHoverPopup = ({
  spell,
  children,
  positionPreference = "horizontal",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const triggerRef = useRef(null);

  const tierLabel = TIER_LABELS[spell?.tier] ?? "Spell";
  const kindLabel = KIND_LABELS[spell?.kind] ?? "Action";
  const tierSubtitle =
    spell?.tier === "C"
      ? "Cantrip Spell"
      : `${tierLabel} ${spell?.school ?? "Spell"}`;

  const summaryText =
    spell?.description ??
    "A prepared spell available for quick casting from your action bar.";

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
  const damageRows = Array.isArray(spell?.damageRows) ? spell.damageRows : [];
  const mechanics = Array.isArray(spell?.mechanics) ? spell.mechanics : [];
  const popupArt = spell?.popupIcon ?? spell?.icon ?? null;

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
                {spell?.damageHeadline && (
                  <p className="spell-hover-popup-damage-headline">
                    {spell.damageHeadline}
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
                  <img src={DiceIcon} alt="" draggable={false} />
                </div>
                <div className="spell-hover-popup-damage-list">
                  {damageRows.map((row, index) => {
                    const typeIcon = DAMAGE_TYPE_ICONS[row.icon];

                    return (
                      <p
                        key={`${row.formula}-${row.type}-${index}`}
                        className={
                          index === 0
                            ? "spell-hover-popup-damage-row"
                            : "spell-hover-popup-damage-row is-secondary"
                        }
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

            <p className="popup-description">{summaryText}</p>

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
            </div>
          </div>
        </Popup>
      )}
    </div>
  );
};

export default SpellHoverPopup;
