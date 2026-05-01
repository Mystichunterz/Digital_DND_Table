import { useEffect, useRef, useState } from "react";
import Popup from "./Popup";
import ResistanceArrow from "./ResistanceArrow";

import "../../styles/components/popups/resistance-popup.scss";

const ResistancePopup = ({
  title,
  rules = [],
  children,
  positionPreference = "vertical",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isHovered) {
      const timer = setTimeout(() => setIsHovered(false), 3000000);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  return (
    <div
      className="resistance-popup-wrapper"
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
          <div className="resistance-popup-content">
            <h5 className="resistance-popup-title">{title}</h5>
            <ul className="resistance-popup-rules">
              {rules.map((rule, index) => (
                <li
                  key={`${rule.kind ?? "rule"}-${index}`}
                  className="resistance-popup-rule"
                >
                  <ResistanceArrow
                    variant={rule.kind === "magical" ? "magical" : "non-magical"}
                    className="resistance-popup-rule-icon"
                  />
                  <p className="resistance-popup-rule-text">{rule.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </Popup>
      )}
    </div>
  );
};

export default ResistancePopup;
