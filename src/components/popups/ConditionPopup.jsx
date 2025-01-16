//----------------------
//  src > components > popups > ConditionPopup.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { useRef, useState, useEffect } from "react";
import Popup from "./Popup";

import "../../styles/components/popups/condition-popup.scss";

import Duration_Icon from "../../assets/popups/Duration_Icon.png";

//----------------------
//  main
//----------------------
const ConditionPopup = ({ icon, title, subtitle, text, duration = "", children }) => {
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

  // Note: Unused unless onMouseLeave={() => setIsHovered(false) is set to true
  // Forces popup to stay on screen for debugging purposes
  useEffect(() => {
    if (isHovered) {
      const timer = setTimeout(() => {
        setIsHovered(false);
      }, 3000000);

      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  return (
    <div className="condition-popup-wrapper" ref={triggerRef} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {children}
      {isHovered && (
        <Popup triggerRef={triggerRef}>
          <div className="condition-popup-content">
            <div className="condition-popup-text">
              <h5 className="popup-title">{title}</h5>
              <p className={`popup-subtitle ${!duration ? "no-duration" : ""}`}>{subtitle}</p>

              {duration ? (
                <div className="popup-duration-container">
                  <img src={Duration_Icon} alt="Duration Icon" className="popup-duration-icon" />
                  <p className="popup-duration">{duration}</p>
                </div>
              ) : (
                <div className="empty-duration-space"></div>
              )}

              <p className="popup-description">{renderStyledText(text)}</p>
            </div>
            {/* <div className="popup-image-container">
              <img src={icon} alt={title} className="popup-image" />
            </div> */}
          </div>
        </Popup>
      )}
    </div>
  );
};

//----------------------
//  exports
//----------------------
export default ConditionPopup;
