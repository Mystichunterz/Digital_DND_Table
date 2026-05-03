import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getCondition, PERMANENT_CONDITION_IDS } from "../data/conditionsCatalog";

const ConditionsContext = createContext(null);

const DEFAULT_ACTIVE_CONDITIONS = PERMANENT_CONDITION_IDS.map((id) => ({
  id,
  remainingTurns: Number.POSITIVE_INFINITY,
}));

export const ConditionsProvider = ({ children }) => {
  const [activeConditions, setActiveConditions] = useState(
    DEFAULT_ACTIVE_CONDITIONS,
  );

  const applyCondition = useCallback((conditionId, durationTurns) => {
    const definition = getCondition(conditionId);

    if (!definition) {
      return;
    }

    setActiveConditions((current) => {
      const filtered = current.filter((entry) => entry.id !== conditionId);

      return [
        ...filtered,
        {
          id: conditionId,
          remainingTurns:
            typeof durationTurns === "number" && durationTurns > 0
              ? durationTurns
              : 1,
        },
      ];
    });
  }, []);

  const removeCondition = useCallback((conditionId) => {
    setActiveConditions((current) =>
      current.filter((entry) => entry.id !== conditionId),
    );
  }, []);

  const tickConditions = useCallback(() => {
    setActiveConditions((current) => {
      const next = [];
      const followUps = [];

      for (const entry of current) {
        const definition = getCondition(entry.id);

        if (definition?.permanent) {
          next.push(entry);
          continue;
        }

        const remainingTurns = entry.remainingTurns - 1;

        if (remainingTurns > 0) {
          next.push({ ...entry, remainingTurns });
          continue;
        }

        const followUp = definition?.onExpire;

        if (followUp?.condition) {
          followUps.push({
            id: followUp.condition,
            remainingTurns:
              typeof followUp.durationTurns === "number" &&
              followUp.durationTurns > 0
                ? followUp.durationTurns
                : 1,
          });
        }
      }

      const followUpIds = new Set(followUps.map((entry) => entry.id));
      const filtered = next.filter((entry) => !followUpIds.has(entry.id));

      return [...filtered, ...followUps];
    });
  }, []);

  const clearConditions = useCallback(() => setActiveConditions([]), []);

  const value = useMemo(
    () => ({
      activeConditions,
      applyCondition,
      removeCondition,
      tickConditions,
      clearConditions,
    }),
    [
      activeConditions,
      applyCondition,
      removeCondition,
      tickConditions,
      clearConditions,
    ],
  );

  return (
    <ConditionsContext.Provider value={value}>
      {children}
    </ConditionsContext.Provider>
  );
};

export const useConditions = () => {
  const context = useContext(ConditionsContext);

  if (!context) {
    throw new Error("useConditions must be used within ConditionsProvider");
  }

  return context;
};
