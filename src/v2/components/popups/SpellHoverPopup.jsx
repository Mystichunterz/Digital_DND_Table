import { useEffect, useMemo, useRef, useState } from "react";
import Popup from "./Popup";
import { formulaRange, substituteTokens } from "../../data/formulas";
import { useCharacterStats } from "../../state/CharacterStatsContext";
import {
  ChannelDivinityIcon,
  DAMAGE_TYPE_ICONS,
  KIND_ICONS,
  KIND_LABELS,
  MECHANIC_ICONS,
  RitualIcon,
  SpellSlotIcon,
  TIER_LABELS,
  pickDiceIcon,
} from "./spellHover/assets";
import DamageBreakdownPopup from "./spellHover/DamageBreakdownPopup";

import "../../styles/components/popups/spell-hover-popup.scss";

const SpellHoverPopup = ({
  spell,
  children,
  positionPreference = "horizontal",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isDamageHovered, setIsDamageHovered] = useState(false);
  const triggerRef = useRef(null);
  const damageHeadlineRef = useRef(null);
  const { tokenValues } = useCharacterStats();

  useEffect(() => {
    if (!isHovered && !isPinned) {
      setIsDamageHovered(false);
    }
  }, [isHovered, isPinned]);

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
  const rawDamageRows = useMemo(
    () => (Array.isArray(spell?.damageRows) ? spell.damageRows : []),
    [spell?.damageRows],
  );
  const damageRows = useMemo(
    () =>
      rawDamageRows.map((row) => ({
        ...row,
        formula: substituteTokens(row.formula ?? "", tokenValues),
      })),
    [rawDamageRows, tokenValues],
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
                <img src={popupArt} alt="" decoding="async" />
              </div>
            )}

            <div className="spell-hover-popup-header">
              <div className="spell-hover-popup-title-block">
                <h5 className="popup-title">{spell?.name ?? "Spell"}</h5>
                <p className="popup-subtitle">{tierSubtitle}</p>
                {damageHeadline && (
                  <p
                    ref={damageHeadlineRef}
                    className={
                      isPinned
                        ? "spell-hover-popup-damage-headline is-inspectable"
                        : "spell-hover-popup-damage-headline"
                    }
                    onMouseEnter={() => setIsDamageHovered(true)}
                    onMouseLeave={() => setIsDamageHovered(false)}
                  >
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
                    const typeClass = row.icon ? `is-type-${row.icon}` : "";

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

      {isPinned && isDamageHovered && rawDamageRows.length > 0 && (
        <DamageBreakdownPopup
          anchorRef={damageHeadlineRef}
          rawRows={rawDamageRows}
          tokenValues={tokenValues}
        />
      )}
    </div>
  );
};

export default SpellHoverPopup;
