import { useCallback, useEffect, useState } from "react";
import { SECTION_CONFIG, SECTION_SLOT_COUNT } from "./sectionLayout";

const findSectionIdForAction = (action) =>
  SECTION_CONFIG.find((section) => section.categoryId === action.category)
    ?.id ?? null;

export const useActionDragDrop = ({ setSectionLayouts, activeFilter }) => {
  const [draggedAction, setDraggedAction] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  useEffect(() => {
    setDraggedAction(null);
    setDropTarget(null);
  }, [activeFilter]);

  const handleSpellbookDragStart = useCallback((event, action) => {
    const sectionId = findSectionIdForAction(action);

    if (!sectionId) {
      event.preventDefault();
      return;
    }

    setDraggedAction({
      source: "spellbook",
      sectionId,
      itemId: action.id,
    });
    event.dataTransfer.effectAllowed = "copyMove";
    event.dataTransfer.setData("text/plain", action.id);
  }, []);

  const handleSpellbookDragEnd = useCallback(() => {
    setDraggedAction(null);
    setDropTarget(null);
  }, []);

  const handleTileDragStart = useCallback(
    (event, item, sectionId, slotIndex) => {
      setDraggedAction({
        source: "bar",
        sectionId,
        slotIndex,
        itemId: item.id,
      });
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", item.id);
    },
    [],
  );

  const handleTileDragEnd = useCallback(() => {
    setDraggedAction(null);
    setDropTarget(null);
  }, []);

  const handleTileDragOver = useCallback((sectionId, slotIndex) => {
    setDropTarget({ sectionId, slotIndex });
  }, []);

  const handleTileDrop = useCallback(
    (targetSectionId, targetIndex) => {
      setSectionLayouts((currentLayouts) => {
        if (!draggedAction || draggedAction.sectionId !== targetSectionId) {
          return currentLayouts;
        }

        const currentSlots =
          currentLayouts[targetSectionId] ??
          Array(SECTION_SLOT_COUNT).fill(null);
        const nextSlots = [...currentSlots];

        if (draggedAction.source === "spellbook") {
          const itemId = draggedAction.itemId;
          const existingIndex = nextSlots.indexOf(itemId);
          const displacedValue = nextSlots[targetIndex] ?? null;

          if (existingIndex === targetIndex) {
            return currentLayouts;
          }

          if (existingIndex !== -1) {
            nextSlots[existingIndex] = displacedValue;
          } else if (displacedValue !== null) {
            const emptySlotIndex = nextSlots.indexOf(null);

            if (emptySlotIndex !== -1) {
              nextSlots[emptySlotIndex] = displacedValue;
            }
          }

          nextSlots[targetIndex] = itemId;
        } else {
          const sourceValue = nextSlots[draggedAction.slotIndex] ?? null;
          const targetValue = nextSlots[targetIndex] ?? null;

          if (sourceValue === null && targetValue === null) {
            return currentLayouts;
          }

          nextSlots[draggedAction.slotIndex] = targetValue;
          nextSlots[targetIndex] = sourceValue;
        }

        return {
          ...currentLayouts,
          [targetSectionId]: nextSlots,
        };
      });
      setDropTarget(null);
    },
    [draggedAction, setSectionLayouts],
  );

  return {
    draggedAction,
    dropTarget,
    handleSpellbookDragStart,
    handleSpellbookDragEnd,
    handleTileDragStart,
    handleTileDragEnd,
    handleTileDragOver,
    handleTileDrop,
  };
};
