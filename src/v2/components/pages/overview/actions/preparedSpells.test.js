import { describe, it, expect } from "vitest";
import {
  DEFAULT_PREPARED_SPELL_IDS,
  isActionLockedForPreparation,
  requiresPreparation,
  sanitizePreparedLimitsByClass,
  sanitizePreparedSpellIds,
} from "./preparedSpells";

const preparablePaladinSpell = {
  id: "paladin-cure-wounds",
  class: "paladin",
  spellbookRow: "tier-1",
};

const classFeature = {
  id: "paladin-channel-oath",
  class: "paladin",
  spellbookRow: "class-action",
};

describe("requiresPreparation", () => {
  it("is true for preparable paladin tier rows", () => {
    expect(requiresPreparation(preparablePaladinSpell)).toBe(true);
  });

  it("is false for class actions outside the preparable rows", () => {
    expect(requiresPreparation(classFeature)).toBe(false);
  });

  it("is false for unknown classes", () => {
    expect(requiresPreparation({ class: "wizard", spellbookRow: "tier-1" })).toBe(
      false,
    );
  });
});

describe("isActionLockedForPreparation", () => {
  it("locks a preparable spell when no class list is provided", () => {
    expect(isActionLockedForPreparation(preparablePaladinSpell, undefined)).toBe(
      true,
    );
  });

  it("unlocks a preparable spell when its id is in the prepared list", () => {
    expect(
      isActionLockedForPreparation(preparablePaladinSpell, {
        paladin: [preparablePaladinSpell.id],
      }),
    ).toBe(false);
  });

  it("never locks actions that don't require preparation", () => {
    expect(isActionLockedForPreparation(classFeature, { paladin: [] })).toBe(false);
  });
});

describe("sanitizePreparedSpellIds", () => {
  it("falls back to the default shape when input is malformed", () => {
    expect(sanitizePreparedSpellIds(null)).toEqual(DEFAULT_PREPARED_SPELL_IDS);
    expect(sanitizePreparedSpellIds("not-an-object")).toEqual(
      DEFAULT_PREPARED_SPELL_IDS,
    );
  });

  it("drops unknown ids and de-duplicates", () => {
    const result = sanitizePreparedSpellIds({
      paladin: ["not-a-real-spell", "not-a-real-spell"],
    });
    expect(result.paladin).toEqual([]);
  });

  it("respects the per-class prepared limit", () => {
    const result = sanitizePreparedSpellIds(
      { paladin: ["a", "b", "c"] },
      { paladin: 1 },
    );
    expect(result.paladin.length).toBeLessThanOrEqual(1);
  });
});

describe("sanitizePreparedLimitsByClass", () => {
  it("clamps negative values to zero and floors fractional values", () => {
    const result = sanitizePreparedLimitsByClass({ paladin: -3.7 });
    expect(result.paladin).toBe(0);
  });

  it("returns the defaults when input is malformed", () => {
    expect(sanitizePreparedLimitsByClass(null)).toEqual(
      sanitizePreparedLimitsByClass({}),
    );
  });
});
