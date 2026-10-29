import { describe, it, expect } from "vitest";
import {
  getCondition,
  sumAbilityScoreModifiers,
  sumExtraActions,
} from "./conditionsCatalog";

describe("conditionsCatalog", () => {
  it("returns null for an unknown condition id", () => {
    expect(getCondition("not-a-real-condition")).toBeNull();
  });

  it("returns a zero-seeded ability map when no conditions are active", () => {
    expect(sumAbilityScoreModifiers([])).toEqual({
      STR: 0,
      DEX: 0,
      CON: 0,
      INT: 0,
      WIS: 0,
      CHA: 0,
    });
    expect(sumExtraActions([])).toBe(0);
  });
});
