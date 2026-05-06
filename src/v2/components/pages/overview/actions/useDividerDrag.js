import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_SECTION_COLUMNS,
  TOTAL_SECTION_COLUMNS,
  clamp,
} from "./sectionLayout";

// Owns the section grid's draggable column dividers. Returns the
// ref the cluster needs, the current `sectionColumns`, the drag
// state needed for live preview rendering, and the handlers wired
// to the divider buttons. The parent doesn't need to think about
// pointer listeners or boundary maths.
export const useDividerDrag = ({ initialColumns } = {}) => {
  const [sectionColumns, setSectionColumns] = useState(
    initialColumns ?? DEFAULT_SECTION_COLUMNS,
  );
  const [draggedDivider, setDraggedDivider] = useState(null);
  const [dragPreviewRatio, setDragPreviewRatio] = useState(null);
  const gridClusterRef = useRef(null);

  const getPointerRatio = useCallback((pointerX) => {
    const cluster = gridClusterRef.current;

    if (!cluster) {
      return null;
    }

    const bounds = cluster.getBoundingClientRect();

    if (bounds.width <= 0) {
      return null;
    }

    return clamp((pointerX - bounds.left) / bounds.width, 0, 1);
  }, []);

  const getSnappedColumns = useCallback(
    (ratio, columns) => {
      if (ratio === null) {
        return columns;
      }

      const [firstBoundary, secondBoundary] = [
        columns[0],
        columns[0] + columns[1],
      ];

      const targetBoundary = Math.round(ratio * TOTAL_SECTION_COLUMNS);

      if (draggedDivider === 0) {
        const nextFirstBoundary = clamp(targetBoundary, 0, secondBoundary);

        return [
          nextFirstBoundary,
          secondBoundary - nextFirstBoundary,
          TOTAL_SECTION_COLUMNS - secondBoundary,
        ];
      }

      if (draggedDivider === 1) {
        const nextSecondBoundary = clamp(
          targetBoundary,
          firstBoundary,
          TOTAL_SECTION_COLUMNS,
        );

        return [
          firstBoundary,
          nextSecondBoundary - firstBoundary,
          TOTAL_SECTION_COLUMNS - nextSecondBoundary,
        ];
      }

      return columns;
    },
    [draggedDivider],
  );

  useEffect(() => {
    if (draggedDivider === null) {
      return undefined;
    }

    const handlePointerMove = (event) => {
      setDragPreviewRatio(getPointerRatio(event.clientX));
    };

    const stopDragging = () => {
      setSectionColumns((currentColumns) => {
        const nextColumns = getSnappedColumns(dragPreviewRatio, currentColumns);

        if (
          nextColumns[0] === currentColumns[0] &&
          nextColumns[1] === currentColumns[1] &&
          nextColumns[2] === currentColumns[2]
        ) {
          return currentColumns;
        }

        return nextColumns;
      });

      setDraggedDivider(null);
      setDragPreviewRatio(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [draggedDivider, dragPreviewRatio, getPointerRatio, getSnappedColumns]);

  const startDividerDrag = useCallback(
    (dividerIndex, event) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      setDragPreviewRatio(getPointerRatio(event.clientX));
      setDraggedDivider(dividerIndex);
    },
    [getPointerRatio],
  );

  const resetDividers = useCallback(() => {
    setSectionColumns(DEFAULT_SECTION_COLUMNS);
  }, []);

  return {
    gridClusterRef,
    sectionColumns,
    setSectionColumns,
    draggedDivider,
    dragPreviewRatio,
    startDividerDrag,
    resetDividers,
  };
};
