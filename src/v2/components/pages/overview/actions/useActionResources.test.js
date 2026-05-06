import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useActionResources } from "./useActionResources";
import { DEFAULT_RESOURCE_MAX } from "./resources";

describe("useActionResources", () => {
  it("seeds resources from DEFAULT_RESOURCE_MAX on mount", () => {
    const { result } = renderHook(() =>
      useActionResources({ extraActions: 0 }),
    );

    expect(result.current.resources.action).toBe(DEFAULT_RESOURCE_MAX.action);
    expect(result.current.resources.spellSlots[1]).toBe(
      DEFAULT_RESOURCE_MAX.spellSlots[1],
    );
    expect(result.current.resourceMax).toEqual(DEFAULT_RESOURCE_MAX);
  });

  it("adds extraActions to the effective action cap without mutating resourceMax", () => {
    const { result, rerender } = renderHook(
      ({ extraActions }) => useActionResources({ extraActions }),
      { initialProps: { extraActions: 0 } },
    );

    expect(result.current.effectiveResourceMax.action).toBe(1);

    rerender({ extraActions: 2 });

    expect(result.current.effectiveResourceMax.action).toBe(3);
    expect(result.current.resourceMax.action).toBe(1);
  });

  it("adjustResource clamps at zero and at the resource cap", () => {
    const { result } = renderHook(() =>
      useActionResources({ extraActions: 0 }),
    );

    // Start with action = 1.
    act(() => result.current.adjustResource("action", -5));
    expect(result.current.resources.action).toBe(0);

    // Cap is 1, so +5 should still cap at 1.
    act(() => result.current.adjustResource("action", 5));
    expect(result.current.resources.action).toBe(1);
  });

  it("adjustResource scopes to a specific spell-slot tier when given", () => {
    const { result } = renderHook(() =>
      useActionResources({ extraActions: 0 }),
    );

    act(() => result.current.adjustResource("spellSlots", -1, 1));
    expect(result.current.resources.spellSlots[1]).toBe(
      DEFAULT_RESOURCE_MAX.spellSlots[1] - 1,
    );
    expect(result.current.resources.spellSlots[2]).toBe(
      DEFAULT_RESOURCE_MAX.spellSlots[2],
    );
  });

  it("updateResourceMax also caps the live value when the new max is lower", () => {
    const { result } = renderHook(() =>
      useActionResources({ extraActions: 0 }),
    );

    // Resources start at max = 4 for tier 1. Drop the cap to 1.
    act(() => result.current.updateResourceMax("spellSlots", 1, 1));

    expect(result.current.resourceMax.spellSlots[1]).toBe(1);
    expect(result.current.resources.spellSlots[1]).toBeLessThanOrEqual(1);
  });

  it("restoreLongRest sets all resources back to their resourceMax", () => {
    const { result } = renderHook(() =>
      useActionResources({ extraActions: 0 }),
    );

    act(() => result.current.adjustResource("action", -1));
    act(() => result.current.adjustResource("layOnHands", -10));
    act(() => result.current.restoreLongRestResources());

    expect(result.current.resources.action).toBe(
      DEFAULT_RESOURCE_MAX.action,
    );
    expect(result.current.resources.layOnHands).toBe(
      DEFAULT_RESOURCE_MAX.layOnHands,
    );
  });

  it("restoreShortRest only refills action / bonus / reaction / channelOath / favouredByGods", () => {
    const { result } = renderHook(() =>
      useActionResources({ extraActions: 0 }),
    );

    act(() => result.current.adjustResource("action", -1));
    act(() => result.current.adjustResource("layOnHands", -10));
    act(() => result.current.restoreShortRestResources());

    expect(result.current.resources.action).toBe(1);
    // Long-rest-only resources stay drained.
    expect(result.current.resources.layOnHands).toBe(
      DEFAULT_RESOURCE_MAX.layOnHands - 10,
    );
  });

  it("restoreNewTurn invokes onTickConditions and refills action with the extras", () => {
    const onTickConditions = vi.fn();
    const { result } = renderHook(() =>
      useActionResources({ extraActions: 2, onTickConditions }),
    );

    act(() => result.current.adjustResource("action", -1));
    act(() => result.current.restoreNewTurnResources());

    expect(onTickConditions).toHaveBeenCalledOnce();
    expect(result.current.resources.action).toBe(3); // 1 base + 2 extras
  });

  it("consumeForAction decrements the matching action economy and the spell slot tier", () => {
    const { result } = renderHook(() =>
      useActionResources({ extraActions: 0 }),
    );

    const before = result.current.resources.spellSlots[2];

    act(() =>
      result.current.consumeForAction({
        kind: "action",
        category: "paladin",
        tier: "II",
      }),
    );

    expect(result.current.resources.action).toBe(0);
    expect(result.current.resources.spellSlots[2]).toBe(before - 1);
  });

  it("consumeForAction is a no-op when affordances are missing", () => {
    const { result } = renderHook(() =>
      useActionResources({ extraActions: 0 }),
    );

    act(() => result.current.adjustResource("action", -1));

    const beforeSlots = { ...result.current.resources.spellSlots };

    act(() =>
      result.current.consumeForAction({
        kind: "action",
        category: "paladin",
        tier: "II",
      }),
    );

    // Action is already 0 — both action and the spell slot stay put.
    expect(result.current.resources.action).toBe(0);
    expect(result.current.resources.spellSlots[2]).toBe(beforeSlots[2]);
  });

  it("resetResourceDefaults restores both resources and resourceMax", () => {
    const { result } = renderHook(() =>
      useActionResources({ extraActions: 0 }),
    );

    act(() => result.current.updateResourceMax("layOnHands", 5));
    expect(result.current.resourceMax.layOnHands).toBe(5);

    act(() => result.current.resetResourceDefaults());
    expect(result.current.resourceMax.layOnHands).toBe(
      DEFAULT_RESOURCE_MAX.layOnHands,
    );
    expect(result.current.resources.layOnHands).toBe(
      DEFAULT_RESOURCE_MAX.layOnHands,
    );
  });
});
