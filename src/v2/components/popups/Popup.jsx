import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "../../styles/components/popups/popup.scss";

const Popup = ({ children, triggerRef, positionPreference = "vertical" }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    if (triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();

      if (positionPreference === "horizontal") {
        setPosition({
          top: rect.top,
          left: rect.right + 16,
        });
      } else {
        setPosition({
          top: rect.bottom + 16,
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
          if (left + popupWidth > window.innerWidth - padding) {
            left = Math.max(triggerRect.left - popupWidth - spacing, padding);
          }
          if (left < padding) {
            left = Math.max(triggerRect.right + spacing, padding);
          }

          if (top + popupHeight > window.innerHeight - padding) {
            top = Math.max(window.innerHeight - popupHeight - padding, padding);
          }
        } else {
          if (top + popupHeight > window.innerHeight - padding) {
            top = Math.max(triggerRect.top - popupHeight - spacing, padding);
          }
          if (top < triggerRect.bottom && top + popupHeight > triggerRect.top) {
            top = triggerRect.bottom + spacing;
          }

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
          <div
            className="popup-window"
            style={{ top: position.top, left: position.left }}
            ref={popupRef}
          >
            {children}
          </div>
        </div>,
        document.getElementById("root"),
      )
    : null;
};

export default Popup;
