import { useMemo, useRef, useState } from "react";
import Popup from "./Popup";

import "../../styles/components/popups/spell-hover-popup.scss";

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
  const subtitle =
    spell?.tier === "C"
      ? "Cantrip Spell"
      : `${tierLabel} ${spell?.school ?? "Spell"}`;

  const summaryText =
    spell?.description ??
    "A prepared spell available for quick casting from your action bar.";

  const saveText = spell?.saveAbility ? `${spell.saveAbility} Save` : "Save --";
  const rangeText = spell?.range ? `${spell.range}` : "Range --";
  const areaText = spell?.area ? `${spell.area}` : "Area --";

  const slotTag = useMemo(() => {
    if (spell?.tier === "C") {
      return "Cantrip";
    }

    return `${tierLabel} Spell Slot`;
  }, [spell?.tier, tierLabel]);

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
          <div className="spell-hover-popup-content">
            <div className="spell-hover-popup-header">
              <div className="spell-hover-popup-title-block">
                <h5 className="popup-title">{spell?.name ?? "Spell"}</h5>
                <p className="popup-subtitle">{subtitle}</p>
              </div>

              <div className="spell-hover-popup-art" aria-hidden="true">
                {spell?.icon ? (
                  <img src={spell.icon} alt="" />
                ) : (
                  <span>{spell?.fallbackIconText ?? spell?.short ?? "SP"}</span>
                )}
              </div>
            </div>

            {spell?.damagePrimary && (
              <p className="spell-hover-popup-damage">{spell.damagePrimary}</p>
            )}

            {spell?.damageSecondary && (
              <p className="spell-hover-popup-damage is-secondary">
                {spell.damageSecondary}
              </p>
            )}

            <p className="popup-description">{summaryText}</p>

            {spell?.onSave && (
              <p className="spell-hover-popup-on-save">
                On Save: {spell.onSave}
              </p>
            )}

            <div className="spell-hover-popup-meta">
              <span>{rangeText}</span>
              <span>{areaText}</span>
              <span>{saveText}</span>
            </div>

            <div className="spell-hover-popup-footer-tags">
              <span>{kindLabel}</span>
              <span>{slotTag}</span>
            </div>
          </div>
        </Popup>
      )}
    </div>
  );
};

export default SpellHoverPopup;
