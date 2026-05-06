import {
  DEFAULT_IMAGE_WIDTH,
  DEFAULT_STICKER_SIZE,
  MAX_IMAGE_WIDTH,
  MAX_STICKER_SIZE,
  MIN_IMAGE_WIDTH,
  MIN_STICKER_SIZE,
} from "./constants";

export const createId = () =>
  `mb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

export const sanitizeItem = (raw, fallbackZ) => {
  if (!raw || typeof raw !== "object") return null;

  const baseProps = {
    id: typeof raw.id === "string" ? raw.id : createId(),
    x: Number.isFinite(raw.x) ? raw.x : 24,
    y: Number.isFinite(raw.y) ? raw.y : 24,
    rotation: Number.isFinite(raw.rotation) ? raw.rotation : 0,
    zIndex: Number.isFinite(raw.zIndex) ? raw.zIndex : fallbackZ,
  };

  if (raw.type === "image") {
    if (typeof raw.dataUrl !== "string" || !raw.dataUrl.startsWith("data:")) {
      return null;
    }
    const naturalWidth = Number.isFinite(raw.naturalWidth)
      ? raw.naturalWidth
      : 1;
    const naturalHeight = Number.isFinite(raw.naturalHeight)
      ? raw.naturalHeight
      : 1;
    return {
      ...baseProps,
      type: "image",
      dataUrl: raw.dataUrl,
      naturalWidth,
      naturalHeight,
      width: clamp(
        Number.isFinite(raw.width) ? raw.width : DEFAULT_IMAGE_WIDTH,
        MIN_IMAGE_WIDTH,
        MAX_IMAGE_WIDTH,
      ),
    };
  }

  if (raw.type === "sticker" && typeof raw.glyph === "string") {
    return {
      ...baseProps,
      type: "sticker",
      glyph: raw.glyph,
      size: clamp(
        Number.isFinite(raw.size) ? raw.size : DEFAULT_STICKER_SIZE,
        MIN_STICKER_SIZE,
        MAX_STICKER_SIZE,
      ),
    };
  }

  return null;
};

export const getItemDimensions = (item) => {
  if (item.type === "sticker") {
    return { width: item.size, height: item.size };
  }
  const aspect = item.naturalHeight / Math.max(item.naturalWidth, 1);
  return { width: item.width, height: item.width * aspect };
};
