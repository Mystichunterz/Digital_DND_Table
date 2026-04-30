//----------------------
//  src > components > popups > InformationPopup.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { useRef, useState, useEffect } from "react";
import Popup from "./Popup";
import "../../styles/components/popups/information-popup.scss";

//----------------------
//  main
//----------------------
const InformationPopup = ({ icon, title, subtitle, description, children, positionPreference = "vertical" }) => {
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

  useEffect(() => {
    if (isHovered) {
      const timer = setTimeout(() => setIsHovered(false), 300000);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  return (
    <div className="information-popup-wrapper" ref={triggerRef} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {children}
      {isHovered && (
        <Popup triggerRef={triggerRef} positionPreference={positionPreference}>
          <div className="information-popup-content">
            <div className="information-popup-text">
              <h5 className="popup-title">{title}</h5>
              {subtitle && <p className="popup-subtitle">{renderStyledText(subtitle)}</p>}
              <p className="popup-description">{renderStyledText(description)}</p>
            </div>
            {icon && (
              <div className="popup-image-container">
                <img src={icon} alt={title} className="popup-image" />
              </div>
            )}
          </div>
        </Popup>
      )}
    </div>
  );
};

//----------------------
//  exports
//----------------------
export default InformationPopup;
