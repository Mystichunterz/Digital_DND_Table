import { describe, it, expect } from "vitest";
import {
  DEFAULT_RESOURCE_MAX,
  buildInitialResources,
  canAffordAction,
  clampResourceValue,
  isSpellAction,
} from "./resources";

describe("buildInitialResources", () => {
  it("clones spellSlots so mutating the result does not leak into the source", () => {
    const initial = buildInitialResources(DEFAULT_RESOURCE_MAX);

    initial.spellSlots[1] = 0;

    expect(DEFAULT_RESOURCE_MAX.spellSlots[1]).toBe(4);
  });

  it("copies every defaulted resource by name", () => {
    const initial = buildInitialResources(DEFAULT_RESOURCE_MAX);

    expect(initial.action).toBe(DEFAULT_RESOURCE_MAX.action);
    expect(initial.layOnHands).toBe(DEFAULT_RESOURCE_MAX.layOnHands);
    expect(initial.sorceryPoints).toBe(DEFAULT_RESOURCE_MAX.sorceryPoints);
  });
});

describe("clampResourceValue", () => {
  it("returns the value when it is in range", () => {
    expect(clampResourceValue(3, 0, 5)).toBe(3);
  });

  it("returns the minimum when the value is below it", () => {
    expect(clampResourceValue(-2, 0, 5)).toBe(0);
  });

  it("returns the maximum when the value is above it", () => {
    expect(clampResourceValue(99, 0, 5)).toBe(5);
  });
});

describe("isSpellAction", () => {
  it("recognises paladin actions as spell actions", () => {
    expect(isSpellAction({ category: "paladin" })).toBe(true);
  });

  it("recognises actions with a spells/ icon key as spell actions", () => {
    expect(isSpellAction({ iconKey: "spells/firebolt.webp" })).toBe(true);
  });

  it("rejects non-spell actions", () => {
    expect(isSpellAction({ category: "common", iconKey: "common/dash.webp" })).toBe(
      false,
    );
    expect(isSpellAction(null)).toBe(false);
  });
});

describe("canAffordAction", () => {
  const fullResources = {
    action: 1,
    bonus: 1,
    reaction: 1,
    spellSlots: { 1: 1, 2: 1, 3: 1 },
  };

  it("allows toggle items even when resources are empty", () => {
    expect(canAffordAction({ toggle: "gwm" }, { action: 0 })).toBe(true);
  });

  it("blocks an action when no action economy is left", () => {
    expect(canAffordAction({ kind: "action" }, { ...fullResources, action: 0 })).toBe(
      false,
    );
  });

  it("blocks a bonus action when no bonus is left", () => {
    expect(canAffordAction({ kind: "bonus" }, { ...fullResources, bonus: 0 })).toBe(
      false,
    );
  });

  it("blocks a reaction when no reaction is left", () => {
    expect(
      canAffordAction({ kind: "reaction" }, { ...fullResources, reaction: 0 }),
    ).toBe(false);
  });

  it("treats cantrips as always affordable in spell-slot terms", () => {
    const item = { kind: "action", category: "paladin", tier: "C" };
    expect(canAffordAction(item, { ...fullResources, spellSlots: {} })).toBe(true);
  });

  it("blocks a spell when its slot tier is empty", () => {
    const item = { kind: "action", category: "paladin", tier: "II" };
    expect(
      canAffordAction(item, { ...fullResources, spellSlots: { 1: 1, 2: 0, 3: 1 } }),
    ).toBe(false);
  });

  it("allows a spell when its slot tier still has charges", () => {
    const item = { kind: "action", category: "paladin", tier: "II" };
    expect(canAffordAction(item, fullResources)).toBe(true);
  });
});
