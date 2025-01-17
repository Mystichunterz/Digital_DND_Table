//----------------------
//  src > components > popups > Popup.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "../../styles/components/popups/popup.scss";

//----------------------
//  main
//----------------------
const Popup = ({ children, triggerRef, onClose, positionPreference = "vertical" }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    if (triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();

      if (positionPreference === "horizontal") {
        setPosition({
          top: rect.top,
          left: rect.right + 16, // Default: appear to the right
        });
      } else {
        setPosition({
          top: rect.bottom + 16, // Default: appear below
          left: rect.left,
        });
      }

      setIsVisible(true);
    }
  }, [triggerRef, positionPreference]);

  useEffect(() => {
    if (isVisible && popupRef.current && triggerRef.current) {
      const popupHeight = popupRef.current.offsetHeight;
      const popupWidth = popupRef.current.offsetWidth;
      const padding = 10;
      const spacing = 16;
      const triggerRect = triggerRef.current?.getBoundingClientRect();

      if (!triggerRect) return;

      setPosition((prev) => {
        let { top, left } = prev;

        if (positionPreference === "horizontal") {
          // Adjust horizontally (left/right)
          if (left + popupWidth > window.innerWidth - padding) {
            left = Math.max(triggerRect.left - popupWidth - spacing, padding); // Move left if needed
          }
          if (left < padding) {
            left = Math.max(triggerRect.right + spacing, padding); // Move right if needed
          }

          // Center vertically if needed
          if (top + popupHeight > window.innerHeight - padding) {
            top = Math.max(window.innerHeight - popupHeight - padding, padding);
          }
        } else {
          // Adjust vertically (top/bottom)
          if (top + popupHeight > window.innerHeight - padding) {
            top = Math.max(triggerRect.top - popupHeight - spacing, padding); // Move above if needed
          }
          if (top < triggerRect.bottom && top + popupHeight > triggerRect.top) {
            top = triggerRect.bottom + spacing; // Ensure no overlap
          }

          // Adjust left position if needed
          if (left + popupWidth > window.innerWidth - padding) {
            left = Math.max(window.innerWidth - popupWidth - padding, padding);
          }
        }

        return { top, left };
      });
    }
  }, [isVisible, triggerRef, positionPreference]);

  return isVisible
    ? ReactDOM.createPortal(
        <div className="popup-container">
          <div className="popup-window" style={{ top: position.top, left: position.left }} ref={popupRef}>
            {children}
          </div>
        </div>,
        document.getElementById("root")
      )
    : null;
};

//----------------------
//  exports
//----------------------
export default Popup;
