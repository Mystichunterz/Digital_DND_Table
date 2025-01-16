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
const Popup = ({ children, triggerRef, onClose }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    if (triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 16,
        left: rect.left,
      });
      setIsVisible(true);
    }
  }, [triggerRef]);

  useEffect(() => {
    if (isVisible && popupRef.current && triggerRef.current) {
      const popupHeight = popupRef.current.offsetHeight;
      const popupWidth = popupRef.current.offsetWidth;
      const padding = 10;
      const spacing = 16;

      setPosition((prev) => {
        let { top, left } = prev;
        const triggerRect = triggerRef.current?.getBoundingClientRect();

        if (!triggerRect) return prev;

        // Adjust position to stay within the viewport
        if (top + popupHeight > window.innerHeight - padding) {
          top = Math.max(triggerRect.top - popupHeight - spacing, padding);
        }
        if (left + popupWidth > window.innerWidth - padding) {
          left = Math.max(window.innerWidth - popupWidth - padding, padding);
        }

        // Ensure popup doesn't overlap the trigger
        if (top < triggerRect.bottom && top + popupHeight > triggerRect.top) {
          top = triggerRect.bottom + spacing;
        }

        return { top, left };
      });
    }
  }, [isVisible, triggerRef]);

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
