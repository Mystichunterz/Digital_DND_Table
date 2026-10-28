import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "./sectionLayout";
import { SPELLBOOK_VIEWPORT_MARGIN } from "./spellbookConfig";

// Owns the SpellbookOverlay's drag-to-reposition state. Returns the
// ref the popup needs, the live position + drag state for styling,
// and the pointer-down handler the overlay's drag handle wires up.
// Re-clamps on window resize and on overlay open so a previously-
// dragged position never leaves the viewport when the geometry
// changes.
export const useSpellbookOverlayPosition = ({ isOpen }) => {
  const spellbookPopupRef = useRef(null);
  const [spellbookPosition, setSpellbookPosition] = useState(null);
  const [spellbookDragState, setSpellbookDragState] = useState(null);

  const clampSpellbookPosition = useCallback((left, top) => {
    const popupElement = spellbookPopupRef.current;
    const popupWidth =
      popupElement?.offsetWidth ?? Math.max(320, window.innerWidth * 0.94);
    const popupHeight =
      popupElement?.offsetHeight ?? Math.max(240, window.innerHeight * 0.78);
    const maxLeft = Math.max(
      SPELLBOOK_VIEWPORT_MARGIN,
      window.innerWidth - popupWidth - SPELLBOOK_VIEWPORT_MARGIN,
    );
    const maxTop = Math.max(
      SPELLBOOK_VIEWPORT_MARGIN,
      window.innerHeight - popupHeight - SPELLBOOK_VIEWPORT_MARGIN,
    );

    return {
      left: clamp(left, SPELLBOOK_VIEWPORT_MARGIN, maxLeft),
      top: clamp(top, SPELLBOOK_VIEWPORT_MARGIN, maxTop),
    };
  }, []);

  useEffect(() => {
    if (!spellbookDragState) {
      return undefined;
    }

    const handlePointerMove = (event) => {
      const nextLeft = event.clientX - spellbookDragState.offsetX;
      const nextTop = event.clientY - spellbookDragState.offsetY;

      setSpellbookPosition(clampSpellbookPosition(nextLeft, nextTop));
    };

    const stopDragging = () => {
      setSpellbookDragState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [spellbookDragState, clampSpellbookPosition]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSpellbookPosition((currentPosition) => {
      if (!currentPosition) {
        return currentPosition;
      }

      return clampSpellbookPosition(currentPosition.left, currentPosition.top);
    });
  }, [isOpen, clampSpellbookPosition]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleResize = () => {
      setSpellbookPosition((currentPosition) => {
        if (!currentPosition) {
          return currentPosition;
        }

        return clampSpellbookPosition(
          currentPosition.left,
          currentPosition.top,
        );
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, clampSpellbookPosition]);

  const handleHeaderPointerDown = useCallback(
    (event) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();

      const popupElement = spellbookPopupRef.current;

      if (!popupElement) {
        return;
      }

      const popupRect = popupElement.getBoundingClientRect();
      const basePosition = spellbookPosition ?? {
        left: popupRect.left,
        top: popupRect.top,
      };

      if (!spellbookPosition) {
        setSpellbookPosition(basePosition);
      }

      setSpellbookDragState({
        offsetX: event.clientX - basePosition.left,
        offsetY: event.clientY - basePosition.top,
      });
    },
    [spellbookPosition],
  );

  return {
    spellbookPopupRef,
    spellbookPosition,
    spellbookDragState,
    handleHeaderPointerDown,
  };
};
