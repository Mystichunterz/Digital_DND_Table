//----------------------
//  src > components > popups > FeaturePopup.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { useRef, useState, useEffect } from "react";
import Popup from "./Popup";

import "../../styles/components/popups/feature-popup.scss";

//----------------------
//  main
//----------------------
const FeaturePopup = ({ icon, title, subtitle, text, children }) => {
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
    <div className="feature-popup-wrapper" ref={triggerRef} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {children}
      {isHovered && (
        <Popup triggerRef={triggerRef}>
          <div className="feature-popup-content">
            <div className="feature-popup-text">
              <h5 className="popup-title">{title}</h5>
              <p className="popup-subtitle">{subtitle}</p>
              <p className="popup-description">{renderStyledText(text)}</p>
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
export default FeaturePopup;
