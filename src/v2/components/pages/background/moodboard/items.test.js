import { describe, it, expect } from "vitest";
import { clamp, getItemDimensions, sanitizeItem } from "./items";
import {
  DEFAULT_IMAGE_WIDTH,
  DEFAULT_STICKER_SIZE,
  MAX_IMAGE_WIDTH,
  MAX_STICKER_SIZE,
  MIN_IMAGE_WIDTH,
  MIN_STICKER_SIZE,
} from "./constants";

describe("clamp", () => {
  it("returns the value when in range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps below the floor", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });

  it("clamps above the ceiling", () => {
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe("sanitizeItem", () => {
  it("rejects non-object input", () => {
    expect(sanitizeItem(null, 0)).toBeNull();
    expect(sanitizeItem("nope", 0)).toBeNull();
  });

  it("rejects images without a data: URL", () => {
    expect(
      sanitizeItem({ type: "image", dataUrl: "https://example.com/x.png" }, 0),
    ).toBeNull();
  });

  it("preserves valid image fields and clamps width", () => {
    const item = sanitizeItem(
      {
        type: "image",
        dataUrl: "data:image/png;base64,AAAA",
        width: MAX_IMAGE_WIDTH + 100,
        naturalWidth: 800,
        naturalHeight: 400,
      },
      3,
    );

    expect(item).toMatchObject({
      type: "image",
      dataUrl: "data:image/png;base64,AAAA",
      width: MAX_IMAGE_WIDTH,
      zIndex: 3,
      naturalWidth: 800,
      naturalHeight: 400,
    });
  });

  it("falls back to defaults when image fields are missing", () => {
    const item = sanitizeItem(
      { type: "image", dataUrl: "data:image/png;base64,AAAA" },
      0,
    );
    expect(item.width).toBe(DEFAULT_IMAGE_WIDTH);
    expect(item.naturalWidth).toBe(1);
    expect(item.naturalHeight).toBe(1);
  });

  it("preserves valid sticker fields and clamps size", () => {
    const item = sanitizeItem(
      { type: "sticker", glyph: "⭐", size: MIN_STICKER_SIZE - 10 },
      1,
    );
    expect(item).toMatchObject({
      type: "sticker",
      glyph: "⭐",
      size: MIN_STICKER_SIZE,
      zIndex: 1,
    });
  });

  it("rejects stickers without a glyph", () => {
    expect(sanitizeItem({ type: "sticker" }, 0)).toBeNull();
  });

  it("rejects unknown types", () => {
    expect(sanitizeItem({ type: "audio", glyph: "foo" }, 0)).toBeNull();
  });
});

describe("getItemDimensions", () => {
  it("returns square dimensions for stickers", () => {
    expect(getItemDimensions({ type: "sticker", size: 64 })).toEqual({
      width: 64,
      height: 64,
    });
  });

  it("returns aspect-corrected dimensions for images", () => {
    const dims = getItemDimensions({
      type: "image",
      width: 200,
      naturalWidth: 400,
      naturalHeight: 100,
    });
    expect(dims.width).toBe(200);
    expect(dims.height).toBe(50);
  });

  it("guards against zero natural width", () => {
    const dims = getItemDimensions({
      type: "image",
      width: 200,
      naturalWidth: 0,
      naturalHeight: 100,
    });
    expect(Number.isFinite(dims.height)).toBe(true);
  });
});

describe("clamp boundaries", () => {
  it("respects MIN_IMAGE_WIDTH and MAX_STICKER_SIZE", () => {
    expect(clamp(0, MIN_IMAGE_WIDTH, MAX_IMAGE_WIDTH)).toBe(MIN_IMAGE_WIDTH);
    expect(clamp(9999, MIN_STICKER_SIZE, MAX_STICKER_SIZE)).toBe(
      MAX_STICKER_SIZE,
    );
    expect(clamp(DEFAULT_STICKER_SIZE, MIN_STICKER_SIZE, MAX_STICKER_SIZE)).toBe(
      DEFAULT_STICKER_SIZE,
    );
  });
});
