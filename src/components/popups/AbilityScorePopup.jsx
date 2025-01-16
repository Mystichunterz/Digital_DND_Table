import { useRef, useState, useEffect } from "react";
import Popup from "./Popup";

import "../../styles/components/popups/ability-score-popup.scss";

const AbilityScorePopup = ({ icon, title, subtitle, text, value, isPrimary, isProficient, savingThrows, sources, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const triggerRef = useRef(null);

  const renderStyledText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)|(\n)/);
    return parts
      .filter((part) => part)
      .map((part, index) => {
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

  const processSavingThrows = (savingThrows) => {
    if (!Array.isArray(savingThrows)) {
      console.error("Expected an array for savingThrows, received:", savingThrows);
      return [];
    }
    return savingThrows.map((save) => {
      const [name, value] = save.split(", ");
      return `**${value}** from ${name}`;
    });
  };

  const calculateOverallSavingThrow = (savingThrows) => {
    return savingThrows.reduce((acc, save) => {
      const [_, value] = save.split(", ");
      return acc + parseInt(value);
    }, 0);
  };

  const calculateCheck = (value) => {
    return Math.floor((value - 10) / 2);
  };

  useEffect(() => {
    if (isHovered) {
      const timer = setTimeout(() => {
        setIsHovered(false);
      }, 3000000);

      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  return (
    <div className="ability-score-popup-wrapper" ref={triggerRef} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(true)}>
      {children}
      {isHovered && (
        <Popup triggerRef={triggerRef}>
          <div className="ability-score-popup-content">
            <div className="ability-score-popup-text">
              <h5 className="popup-title">
                {title} ({value})
              </h5>
              <p className="popup-subtitle">{subtitle}</p>
              <p className="popup-check-title">{renderStyledText(`+${calculateCheck(value)} to ${title} **Checks**`)}</p>
              <p className="popup-description">{renderStyledText(text)}</p>
              <div className="popup-saves">
                <p className="popup-save-title">{`+${calculateOverallSavingThrow(savingThrows)} to Saving Throws`}</p>
                {processSavingThrows(savingThrows).map((save, index) => (
                  <p key={index} className="popup-save">
                    {renderStyledText(save)}
                  </p>
                ))}
              </div>
              <div className="popup-sources">
                <p className="popup-source-title">Your Ability Points come from:</p>
                {sources.map((source, index) => (
                  <p key={index} className="popup-source">
                    {renderStyledText(source)}
                  </p>
                ))}
              </div>
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

export default AbilityScorePopup;
