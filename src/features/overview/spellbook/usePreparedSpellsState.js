import { useCallback, useState } from "react";
import {
  DEFAULT_PREPARED_LIMITS_BY_CLASS,
  DEFAULT_PREPARED_SPELL_IDS,
} from "./preparedSpells";

export const usePreparedSpellsState = () => {
  const [preparedSpellIds, setPreparedSpellIds] = useState(
    DEFAULT_PREPARED_SPELL_IDS,
  );
  const [preparedLimitsByClass, setPreparedLimitsByClass] = useState(
    DEFAULT_PREPARED_LIMITS_BY_CLASS,
  );

  const togglePreparedSpell = useCallback(
    (classId, actionId) => {
      const cap =
        preparedLimitsByClass[classId] ??
        DEFAULT_PREPARED_LIMITS_BY_CLASS[classId];

      setPreparedSpellIds((current) => {
        const currentList = current[classId] ?? [];

        if (currentList.includes(actionId)) {
          return {
            ...current,
            [classId]: currentList.filter((id) => id !== actionId),
          };
        }

        if (typeof cap === "number" && currentList.length >= cap) {
          return current;
        }

        return {
          ...current,
          [classId]: [...currentList, actionId],
        };
      });
    },
    [preparedLimitsByClass],
  );

  const updatePreparedLimit = useCallback((classId, value) => {
    const safeValue = Math.max(0, Math.floor(Number(value) || 0));

    setPreparedLimitsByClass((current) => ({
      ...current,
      [classId]: safeValue,
    }));
  }, []);

  const resetPreparedLimits = useCallback(() => {
    setPreparedLimitsByClass(DEFAULT_PREPARED_LIMITS_BY_CLASS);
  }, []);

  return {
    preparedSpellIds,
    setPreparedSpellIds,
    preparedLimitsByClass,
    setPreparedLimitsByClass,
    togglePreparedSpell,
    updatePreparedLimit,
    resetPreparedLimits,
  };
};
