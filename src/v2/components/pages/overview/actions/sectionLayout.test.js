import { describe, it, expect } from "vitest";
import {
  SECTION_CONFIG,
  SECTION_SLOT_COUNT,
  SECTION_SLOT_ROWS,
  clamp,
  createInitialSectionLayouts,
  normalizeImportedLayouts,
} from "./sectionLayout";

describe("clamp", () => {
  it("returns the value when in range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps to the minimum when below", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it("clamps to the maximum when above", () => {
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe("section slot geometry", () => {
  it("scales row count by total columns from SECTION_CONFIG", () => {
    const expectedColumns = SECTION_CONFIG.reduce(
      (sum, section) => sum + section.defaultColumns,
      0,
    );

    expect(SECTION_SLOT_COUNT).toBe(expectedColumns * SECTION_SLOT_ROWS);
  });
});

describe("createInitialSectionLayouts", () => {
  it("produces one slot array per section, sized to the slot count", () => {
    const layouts = createInitialSectionLayouts();

    SECTION_CONFIG.forEach((section) => {
      expect(layouts[section.id]).toBeInstanceOf(Array);
      expect(layouts[section.id].length).toBe(SECTION_SLOT_COUNT);
    });
  });
});

describe("normalizeImportedLayouts", () => {
  it("returns the default layouts when input is null or malformed", () => {
    const baseline = createInitialSectionLayouts();

    expect(normalizeImportedLayouts(null)).toEqual(baseline);
    expect(normalizeImportedLayouts("nonsense")).toEqual(baseline);
  });

  it("ignores action ids that aren't in the section's category", () => {
    const result = normalizeImportedLayouts({
      common: ["not-a-real-action", "also-not-real"],
    });

    expect(result.common.every((slot) => slot !== "not-a-real-action")).toBe(
      true,
    );
  });
});
