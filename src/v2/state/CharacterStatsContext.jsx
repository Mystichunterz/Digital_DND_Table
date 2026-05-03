import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { BASE_SCORES, computeDerived } from "../data/characterStats";
import { sumAbilityScoreModifiers } from "../data/conditionsCatalog";
import { useConditions } from "./ConditionsContext";

const CharacterStatsContext = createContext(null);

const SCORE_MIN = 1;
const SCORE_MAX = 30;

const clampScore = (value) => {
  const next = Math.floor(Number(value));
  if (!Number.isFinite(next)) {
    return null;
  }
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, next));
};

export const CharacterStatsProvider = ({ children }) => {
  const [baseScores, setBaseScores] = useState(BASE_SCORES);
  const { activeConditions } = useConditions();

  const abilityScoreModifiers = useMemo(
    () => sumAbilityScoreModifiers(activeConditions),
    [activeConditions],
  );

  const derived = useMemo(
    () => computeDerived(baseScores, abilityScoreModifiers),
    [baseScores, abilityScoreModifiers],
  );

  const setBaseScore = useCallback((ability, score) => {
    const clamped = clampScore(score);
    if (clamped === null) {
      return;
    }
    setBaseScores((current) =>
      current[ability] === clamped
        ? current
        : { ...current, [ability]: clamped },
    );
  }, []);

  const adjustBaseScore = useCallback((ability, delta) => {
    setBaseScores((current) => {
      const next = clampScore((current[ability] ?? 0) + delta);
      if (next === null || next === current[ability]) {
        return current;
      }
      return { ...current, [ability]: next };
    });
  }, []);

  const value = useMemo(
    () => ({
      baseScores,
      abilityScoreModifiers,
      effectiveScores: derived.effectiveScores,
      modifiers: derived.modifiers,
      proficiencyBonus: derived.proficiencyBonus,
      spellAttack: derived.spellAttack,
      spellDc: derived.spellDc,
      tokenValues: derived.tokenValues,
      setBaseScore,
      adjustBaseScore,
    }),
    [baseScores, abilityScoreModifiers, derived, setBaseScore, adjustBaseScore],
  );

  return (
    <CharacterStatsContext.Provider value={value}>
      {children}
    </CharacterStatsContext.Provider>
  );
};

export const useCharacterStats = () => {
  const context = useContext(CharacterStatsContext);

  if (!context) {
    throw new Error(
      "useCharacterStats must be used within CharacterStatsProvider",
    );
  }

  return context;
};
