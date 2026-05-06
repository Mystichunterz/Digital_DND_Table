import { useCallback, useState } from "react";
import {
  MAX_IMAGE_WIDTH,
  MAX_STICKER_SIZE,
  MIN_IMAGE_WIDTH,
  MIN_STICKER_SIZE,
} from "./constants";
import { clamp, getItemDimensions } from "./items";

// Owns the moodboard's drag / resize / rotate gesture state. The
// caller owns `items` (for canonical state + persistence) and
// `bringToFront`; this hook just translates pointer events into
// item-shape mutations and returns the active operation so the
// canvas root can render the correct cursor class.
export const useMoodboardPointerOps = ({
  items: _items,
  setItems,
  canvasRef,
  bringToFront,
}) => {
  const [activeOp, setActiveOp] = useState(null);

  const handleItemPointerDown = useCallback(
    (event, item) => {
      if (event.button !== 0 || event.target.closest("button")) {
        return;
      }

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      bringToFront(item.id);

      setActiveOp({
        mode: "drag",
        id: item.id,
        pointerId: event.pointerId,
        offsetX: event.clientX - item.x,
        offsetY: event.clientY - item.y,
      });
    },
    [bringToFront],
  );

  const handleResizePointerDown = useCallback(
    (event, item) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      bringToFront(item.id);

      const dims = getItemDimensions(item);
      const centerX = item.x + dims.width / 2;
      const centerY = item.y + dims.height / 2;
      const canvas = canvasRef.current;
      const bounds = canvas?.getBoundingClientRect();
      const pointerInCanvasX = bounds
        ? event.clientX - bounds.left
        : event.clientX;
      const pointerInCanvasY = bounds
        ? event.clientY - bounds.top
        : event.clientY;
      const startDistance = Math.hypot(
        pointerInCanvasX - centerX,
        pointerInCanvasY - centerY,
      );

      setActiveOp({
        mode: "resize",
        id: item.id,
        pointerId: event.pointerId,
        startWidth: item.type === "image" ? item.width : item.size,
        startDistance: Math.max(startDistance, 1),
        itemType: item.type,
      });
    },
    [bringToFront, canvasRef],
  );

  const handleRotatePointerDown = useCallback(
    (event, item) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      bringToFront(item.id);

      const dims = getItemDimensions(item);
      const centerX = item.x + dims.width / 2;
      const centerY = item.y + dims.height / 2;
      const canvas = canvasRef.current;
      const bounds = canvas?.getBoundingClientRect();
      const pointerInCanvasX = bounds
        ? event.clientX - bounds.left
        : event.clientX;
      const pointerInCanvasY = bounds
        ? event.clientY - bounds.top
        : event.clientY;
      const startAngle = Math.atan2(
        pointerInCanvasY - centerY,
        pointerInCanvasX - centerX,
      );

      setActiveOp({
        mode: "rotate",
        id: item.id,
        pointerId: event.pointerId,
        centerX,
        centerY,
        startAngle,
        startRotation: item.rotation,
      });
    },
    [bringToFront, canvasRef],
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (!activeOp || event.pointerId !== activeOp.pointerId) return;

      const canvas = canvasRef.current;
      const bounds = canvas?.getBoundingClientRect();

      if (activeOp.mode === "drag") {
        const nextX = event.clientX - activeOp.offsetX;
        const nextY = event.clientY - activeOp.offsetY;
        setItems((current) =>
          current.map((item) => {
            if (item.id !== activeOp.id) return item;
            const dims = getItemDimensions(item);
            if (!bounds) return { ...item, x: nextX, y: nextY };
            const minX = -dims.width / 2;
            const minY = -dims.height / 2;
            const maxX = bounds.width - dims.width / 2;
            const maxY = bounds.height - dims.height / 2;
            return {
              ...item,
              x: clamp(nextX, minX, maxX),
              y: clamp(nextY, minY, maxY),
            };
          }),
        );
        return;
      }

      if (activeOp.mode === "resize") {
        const pointerInCanvasX = bounds
          ? event.clientX - bounds.left
          : event.clientX;
        const pointerInCanvasY = bounds
          ? event.clientY - bounds.top
          : event.clientY;
        setItems((current) =>
          current.map((item) => {
            if (item.id !== activeOp.id) return item;
            const dims = getItemDimensions(item);
            const centerX = item.x + dims.width / 2;
            const centerY = item.y + dims.height / 2;
            const distance = Math.hypot(
              pointerInCanvasX - centerX,
              pointerInCanvasY - centerY,
            );
            const ratio = distance / activeOp.startDistance;
            const target = activeOp.startWidth * ratio;

            if (item.type === "image") {
              return {
                ...item,
                width: clamp(target, MIN_IMAGE_WIDTH, MAX_IMAGE_WIDTH),
              };
            }
            return {
              ...item,
              size: clamp(target, MIN_STICKER_SIZE, MAX_STICKER_SIZE),
            };
          }),
        );
        return;
      }

      if (activeOp.mode === "rotate") {
        const pointerInCanvasX = bounds
          ? event.clientX - bounds.left
          : event.clientX;
        const pointerInCanvasY = bounds
          ? event.clientY - bounds.top
          : event.clientY;
        const angle = Math.atan2(
          pointerInCanvasY - activeOp.centerY,
          pointerInCanvasX - activeOp.centerX,
        );
        const deltaDeg = ((angle - activeOp.startAngle) * 180) / Math.PI;
        const nextRotation = activeOp.startRotation + deltaDeg;
        const snapped = event.shiftKey
          ? Math.round(nextRotation / 15) * 15
          : nextRotation;

        setItems((current) =>
          current.map((item) =>
            item.id === activeOp.id ? { ...item, rotation: snapped } : item,
          ),
        );
      }
    },
    [activeOp, canvasRef, setItems],
  );

  const handlePointerUp = useCallback(
    (event) => {
      if (!activeOp || event.pointerId !== activeOp.pointerId) return;
      setActiveOp(null);
    },
    [activeOp],
  );

  return {
    activeOp,
    handleItemPointerDown,
    handleResizePointerDown,
    handleRotatePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
};
