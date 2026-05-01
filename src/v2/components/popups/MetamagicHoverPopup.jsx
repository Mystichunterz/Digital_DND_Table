import { useRef, useState } from "react";
import Popup from "./Popup";

import "../../styles/components/popups/metamagic-hover-popup.scss";

const renderParagraphs = (description) => {
  if (!description) {
    return null;
  }

  const paragraphs = String(description)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.map((paragraph, index) => (
    <p key={index} className="popup-description">
      {paragraph}
    </p>
  ));
};

const MetamagicHoverPopup = ({
  metamagic,
  children,
  positionPreference = "vertical",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const triggerRef = useRef(null);

  const subtitle = metamagic?.subtitle ?? "Toggleable Passive Feature";
  const popupArt = metamagic?.icon ?? null;

  return (
    <div
      className="metamagic-hover-popup-trigger"
      ref={triggerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
                ? "metamagic-hover-popup-content has-art"
                : "metamagic-hover-popup-content"
            }
          >
            {popupArt && (
              <div className="metamagic-hover-popup-art" aria-hidden="true">
                <img src={popupArt} alt="" draggable={false} />
              </div>
            )}

            <div className="metamagic-hover-popup-header">
              <h5 className="popup-title">
                Metamagic: {metamagic?.name ?? "Spell"}
              </h5>
              <p className="popup-subtitle">{subtitle}</p>
            </div>

            <div className="metamagic-hover-popup-body">
              {renderParagraphs(metamagic?.description)}

              {metamagic?.cost && (
                <p className="popup-description metamagic-hover-popup-cost">
                  {metamagic.cost}
                </p>
              )}

              {metamagic?.note && (
                <p className="popup-description metamagic-hover-popup-note">
                  {metamagic.note}
                </p>
              )}
            </div>
          </div>
        </Popup>
      )}
    </div>
  );
};

export default MetamagicHoverPopup;
