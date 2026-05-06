import { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_RESOURCE_MAX,
  TIER_TO_SLOT_LEVEL,
  buildInitialResources,
  clampResourceValue,
  isSpellAction,
} from "./resources";

// Owns the action panel's resource ledger: per-resource current
// values, per-resource caps, and the various rest / new-turn /
// adjust / max-edit handlers. Returns the live ledger plus the
// handler set the panel wires to V2ResourcePips.
//
// `extraActions` is added to the action cap on new-turn restores
// so condition-driven extras (e.g. Action Surge) are honoured.
// `onTickConditions` lets the panel decrement durations on every
// new-turn restore; the hook calls it once when restoreNewTurn
// fires and otherwise stays out of conditions state.
export const useActionResources = ({ extraActions, onTickConditions }) => {
  const [resourceMax, setResourceMax] = useState(DEFAULT_RESOURCE_MAX);
  const [resources, setResources] = useState(() =>
    buildInitialResources(DEFAULT_RESOURCE_MAX),
  );

  const effectiveResourceMax = useMemo(
    () => ({
      ...resourceMax,
      action: resourceMax.action + (extraActions ?? 0),
    }),
    [resourceMax, extraActions],
  );

  const restoreLongRestResources = useCallback(() => {
    setResources(buildInitialResources(resourceMax));
  }, [resourceMax]);

  const restoreShortRestResources = useCallback(() => {
    setResources((current) => ({
      ...current,
      action: resourceMax.action,
      bonus: resourceMax.bonus,
      reaction: resourceMax.reaction,
      channelOath: resourceMax.channelOath,
      favouredByGods: resourceMax.favouredByGods,
    }));
  }, [resourceMax]);

  const restoreNewTurnResources = useCallback(() => {
    onTickConditions?.();
    setResources((current) => ({
      ...current,
      action: effectiveResourceMax.action,
      bonus: resourceMax.bonus,
      reaction: resourceMax.reaction,
    }));
  }, [effectiveResourceMax, resourceMax, onTickConditions]);

  const resetResourceDefaults = useCallback(() => {
    setResourceMax(DEFAULT_RESOURCE_MAX);
    setResources(buildInitialResources(DEFAULT_RESOURCE_MAX));
  }, []);

  const adjustResource = useCallback(
    (resourceKey, delta, tier) => {
      setResources((current) => {
        const next = { ...current, spellSlots: { ...current.spellSlots } };

        if (tier !== undefined) {
          const tierMax = resourceMax.spellSlots?.[tier] ?? 0;
          next.spellSlots[tier] = clampResourceValue(
            (next.spellSlots[tier] ?? 0) + delta,
            0,
            tierMax,
          );
        } else {
          const keyMax = resourceMax[resourceKey] ?? 0;
          next[resourceKey] = clampResourceValue(
            (next[resourceKey] ?? 0) + delta,
            0,
            keyMax,
          );
        }

        return next;
      });
    },
    [resourceMax],
  );

  const updateResourceMax = useCallback((resourceKey, value, tier) => {
    const safeValue = Math.max(0, Math.floor(Number(value) || 0));

    setResourceMax((current) => {
      const next = { ...current, spellSlots: { ...current.spellSlots } };

      if (tier !== undefined) {
        next.spellSlots[tier] = safeValue;
      } else {
        next[resourceKey] = safeValue;
      }

      return next;
    });

    setResources((current) => {
      const next = { ...current, spellSlots: { ...current.spellSlots } };

      if (tier !== undefined) {
        next.spellSlots[tier] = Math.min(
          next.spellSlots[tier] ?? 0,
          safeValue,
        );
      } else {
        next[resourceKey] = Math.min(next[resourceKey] ?? 0, safeValue);
      }

      return next;
    });
  }, []);

  const consumeForAction = useCallback((item) => {
    if (!item) {
      return;
    }

    setResources((current) => {
      const next = {
        ...current,
        spellSlots: { ...current.spellSlots },
      };

      if (item.kind === "action") {
        if (next.action <= 0) {
          return current;
        }
        next.action -= 1;
      } else if (item.kind === "bonus") {
        if (next.bonus <= 0) {
          return current;
        }
        next.bonus -= 1;
      } else if (item.kind === "reaction") {
        if (next.reaction <= 0) {
          return current;
        }
        next.reaction -= 1;
      }

      const consumesSpellSlot =
        isSpellAction(item) && item.tier && item.tier !== "C";

      if (consumesSpellSlot) {
        const slotLevel = TIER_TO_SLOT_LEVEL[item.tier];

        if (!slotLevel || (next.spellSlots[slotLevel] ?? 0) <= 0) {
          return current;
        }

        next.spellSlots[slotLevel] -= 1;
      }

      return next;
    });
  }, []);

  return {
    resources,
    setResources,
    resourceMax,
    setResourceMax,
    effectiveResourceMax,
    restoreLongRestResources,
    restoreShortRestResources,
    restoreNewTurnResources,
    resetResourceDefaults,
    adjustResource,
    updateResourceMax,
    consumeForAction,
  };
};
