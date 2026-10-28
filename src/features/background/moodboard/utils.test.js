import { describe, it, expect } from "vitest";
import { formatSnapshotTimestamp, isEditableTarget } from "./utils";

describe("isEditableTarget", () => {
  it("returns false for missing targets", () => {
    expect(isEditableTarget(null)).toBe(false);
    expect(isEditableTarget(undefined)).toBe(false);
  });

  it("recognises form fields by tag name", () => {
    expect(isEditableTarget({ tagName: "INPUT" })).toBe(true);
    expect(isEditableTarget({ tagName: "TextArea" })).toBe(true);
    expect(isEditableTarget({ tagName: "SELECT" })).toBe(true);
  });

  it("respects contentEditable on non-form targets", () => {
    expect(isEditableTarget({ tagName: "DIV", isContentEditable: true })).toBe(
      true,
    );
    expect(isEditableTarget({ tagName: "DIV", isContentEditable: false })).toBe(
      false,
    );
  });
});

describe("formatSnapshotTimestamp", () => {
  it("returns a non-empty string for a valid ms value", () => {
    const formatted = formatSnapshotTimestamp(Date.UTC(2026, 4, 6, 12, 0, 0));
    expect(typeof formatted).toBe("string");
    expect(formatted.length).toBeGreaterThan(0);
  });
});
