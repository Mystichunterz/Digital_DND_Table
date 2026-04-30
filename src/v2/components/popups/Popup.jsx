import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "../../styles/components/popups/popup.scss";

const Popup = ({
  children,
  triggerRef,
  positionPreference = "vertical",
  inspectable = true,
  onPinChange,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
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

  useEffect(() => {
    if (!isVisible || !inspectable) return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== "t" && event.key !== "T") return;

      const target = event.target;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      setIsPinned((prev) => {
        const next = !prev;
        onPinChange?.(next);
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, inspectable, onPinChange]);

  const handleBackdropClick = () => {
    setIsPinned(false);
    onPinChange?.(false);
  };

  const toggleInspect = () => {
    setIsPinned((prev) => {
      const next = !prev;
      onPinChange?.(next);
      return next;
    });
  };

  if (!isVisible) return null;

  const containerClassName = isPinned
    ? "popup-container is-pinned"
    : "popup-container";
  const windowClassName = isPinned ? "popup-window is-pinned" : "popup-window";
  const tabClassName = isPinned
    ? "popup-inspect-tab is-pinned"
    : "popup-inspect-tab";

  return ReactDOM.createPortal(
    <div className={containerClassName}>
      {isPinned && (
        <div
          className="popup-backdrop"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}
      <div
        className={windowClassName}
        style={{ top: position.top, left: position.left }}
        ref={popupRef}
      >
        {children}
      </div>
      {inspectable && (
        <button
          type="button"
          className={tabClassName}
          style={{
            top: position.top,
            left: `calc(${position.left}px + 1.1rem)`,
          }}
          onClick={toggleInspect}
          aria-pressed={isPinned}
          aria-label={isPinned ? "Unpin popup" : "Pin popup for inspection"}
          title={isPinned ? "Press T to unpin" : "Press T to pin"}
        >
          <kbd className="popup-inspect-tab-key" aria-hidden="true">
            T
          </kbd>
          <span className="popup-inspect-tab-label">Inspect</span>
        </button>
      )}
    </div>,
    document.getElementById("root"),
  );
};

export default Popup;
