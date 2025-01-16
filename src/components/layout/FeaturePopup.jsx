//----------------------
//  src > layout > FeaturePopup.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

import "../../styles/components/layout/FeaturePopup.scss";

//----------------------
//  main
//----------------------
const FeaturePopup = ({ icon, title, subtitle, text, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [popupRendered, setPopupRendered] = useState(false);
  const popupRef = useRef(null);
  const generatorRect = useRef(null);

  const handleMouseEnter = (event) => {
    setIsHovered(true);
    const rect = event.currentTarget.getBoundingClientRect();
    generatorRect.current = rect;

    const initialPosition = { top: rect.bottom + 16, left: rect.left };
    console.log("Initial position set:", initialPosition);
    setPosition(initialPosition);

    setPopupRendered(true);
    requestAnimationFrame(() => {
      if (popupRef.current) {
        console.log("Forcing recheck of popup dimensions...");
        setPopupRendered(true);
      }
    });
  };

  useEffect(() => {
    if (popupRendered) {
      console.log("Popup rendered, adjusting position...");
    }
  }, [popupRendered]);

  useEffect(() => {
    if (popupRendered && generatorRect.current) {
      const popupHeight = popupRef.current?.offsetHeight || 0;
      const popupWidth = popupRef.current?.offsetWidth || 0;
      const padding = 32; // 2rem padding
      const spacing = 16; // Space between generator and popup

      setPosition((prevPosition) => {
        const rect = generatorRect.current;
        let top = prevPosition.top;
        let left = prevPosition.left;

        // Adjust vertical position
        if (top + popupHeight > window.innerHeight - padding) {
          top = Math.max(rect.top - popupHeight - spacing, padding);
          console.log("Adjusted vertical position to avoid overflow:", top);
        }

        // Ensure popup doesn't overlap the generator
        if (top < rect.bottom && top + popupHeight > rect.top) {
          top = rect.top - popupHeight - spacing;
          console.log("Adjusted vertical position to avoid overlap:", top);
        }

        // Adjust horizontal position
        if (left + popupWidth > window.innerWidth - padding) {
          left = Math.max(window.innerWidth - popupWidth - padding, padding);
          console.log("Adjusted horizontal position to avoid overflow:", left);
        }

        if (left < padding) {
          left = padding;
          console.log("Adjusted horizontal position to stay within bounds:", left);
        }

        const adjustedPosition = { top, left };
        console.log("Final adjusted position:", adjustedPosition);
        return adjustedPosition;
      });

      setPopupRendered(false);
    }
  }, [popupRendered]);

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

  const renderStyledText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)|(\n)/); // Split by **...** and newlines
    return parts
      .filter((part) => part !== undefined && part !== "")
      .map((part, index) => {
        if (part === "\n") {
          return <br key={index} />;
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <span key={index} className="highlighted-text">
              {part.slice(2, -2)} {/* Remove the ** markers */}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      });
  };

  const popupContent = (
    <div className="feature-popup-container">
      <div className="feature-popup-window" style={{ top: position.top, left: position.left }} ref={popupRef}>
        <div className="popup-content">
          <h5 className="popup-title">{title}</h5>
          <p className="popup-subtitle">{subtitle}</p>
          <p className="popup-text">{renderStyledText(text)}</p>
        </div>
        <div className="popup-image-container">
          <img src={icon} alt={title} className="popup-image" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="feature-popup-wrapper" onMouseEnter={handleMouseEnter} onMouseLeave={() => setIsHovered(false)}>
      {children}
      {isHovered && ReactDOM.createPortal(popupContent, document.getElementById("root"))}
    </div>
  );
};

//----------------------
//  exports
//----------------------
export default FeaturePopup;
