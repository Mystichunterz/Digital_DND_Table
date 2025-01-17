//----------------------
//  src > components > popups > InformationPopup.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { useRef, useState, useEffect } from "react";
import Popup from "./Popup";

import "../../styles/components/popups/ability-score-popup.scss";
import D20_Icon from "../../assets/D20.png";

//----------------------
//  main
//----------------------
const AbilityScorePopup = ({ icon, title, subtitle, text, value, isPrimary, isProficient, savingThrows = [], sources = [], children, positionPreference = "vertical" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const triggerRef = useRef(null);

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

  const processSavingThrows = (savingThrowsList) => {
    if (!Array.isArray(savingThrowsList)) {
      console.error("Expected an array for savingThrows, received:", savingThrowsList);
      return [];
    }
    return savingThrowsList.map((save) => {
      const parts = save.split(", ");
      if (parts.length < 2) return save;
      const [name, value] = parts;
      return `**${value}** from ${name}`;
    });
  };

  const calculateOverallSavingThrow = (savingThrowsList) => {
    if (!Array.isArray(savingThrowsList)) return "0";
    const total = savingThrowsList.reduce((acc, save) => {
      const parts = save.split(", ");
      if (parts.length < 2) return acc;
      const value = parseInt(parts[1], 10);
      return acc + (isNaN(value) ? 0 : value);
    }, 0);
    return total >= 0 ? `+${total}` : `${total}`;
  };

  const calculateCheck = (score) => {
    const checkValue = Math.floor((score - 10) / 2);
    return checkValue >= 0 ? `+${checkValue}` : `${checkValue}`;
  };

  useEffect(() => {
    if (isHovered) {
      const timer = setTimeout(() => setIsHovered(false), 3000000);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  return (
    <div className="ability-score-popup-wrapper" ref={triggerRef} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {children}
      {isHovered && (
        <Popup triggerRef={triggerRef} positionPreference={positionPreference}>
          <div className="ability-score-popup-content">
            <div className="ability-score-popup-text">
              <h5 className="popup-title">
                {title} ({value})
              </h5>
              <p className="popup-subtitle">{renderStyledText(`**${subtitle}**`)}</p>

              {/* Checks Section with D20 Icon */}
              <div className="popup-check-container">
                <img src={D20_Icon} alt="D20" className="popup-d20-icon" />
                <p className="popup-check-title">{renderStyledText(`${calculateCheck(value)} to ${title} **Checks**`)}</p>
              </div>

              <p className="popup-description">{renderStyledText(text)}</p>

              {/* Saving Throws */}
              {savingThrows.length > 0 && (
                <div className="popup-saves">
                  <div className="popup-row">
                    <div className="popup-save-container">
                      <div className="popup-icon-container">
                        <img src={D20_Icon} alt="D20" className="popup-d20-icon" />
                      </div>
                      <div className="popup-text-container">
                        <p className="popup-save-title">{renderStyledText(`${calculateOverallSavingThrow(savingThrows)} to Saving Throws`)}</p>
                        {processSavingThrows(savingThrows).map((save, index) => (
                          <p key={index} className="popup-save">
                            {renderStyledText(save)}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sources Section */}
              {sources.length > 0 && (
                <div className="popup-sources">
                  <p className="popup-source-title">Your Ability Points come from:</p>
                  {sources.map((source, index) => (
                    <p key={index} className="popup-source">
                      {renderStyledText(source)}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="popup-image-container">
              <img src={icon} alt={title} className="popup-image" />
            </div>
          </div>
        </Popup>
      )}
    </div>
  );
};

//----------------------
//  exports
//----------------------
export default AbilityScorePopup;
