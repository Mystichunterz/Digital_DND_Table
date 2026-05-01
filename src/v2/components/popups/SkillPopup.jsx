import { useRef, useState } from "react";
import Popup from "./Popup";

import "../../styles/components/popups/skill-popup.scss";
import D20_Icon from "../../../assets/D20.png";

const renderStyledText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)|(\n)/).filter(Boolean);
  return parts.map((part, index) => {
    if (part === "\n") return <br key={index} />;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={index} className="highlighted-text">
          {part.slice(2, -2)}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

const SkillPopup = ({
  name,
  ability,
  modifier,
  description,
  effect,
  children,
  as: WrapperTag = "div",
  className = "",
  positionPreference = "horizontal",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const triggerRef = useRef(null);

  const wrapperClass = ["skill-popup-wrapper", className]
    .filter(Boolean)
    .join(" ");

  return (
    <WrapperTag
      className={wrapperClass}
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
          <div className="skill-popup-content">
            <h5 className="popup-title">{name}</h5>
            <p className="popup-subtitle">{ability}</p>

            <div className="popup-check-container">
              <img src={D20_Icon} alt="D20" className="popup-d20-icon" />
              <p className="popup-check-title">
                {renderStyledText(`${modifier} to ${name} **Checks**`)}
              </p>
            </div>

            {description && (
              <p className="popup-description">
                {renderStyledText(description)}
              </p>
            )}
            {effect && (
              <p className="popup-effect">{renderStyledText(effect)}</p>
            )}
          </div>
        </Popup>
      )}
    </WrapperTag>
  );
};

export default SkillPopup;
