export const BASE_SCORES = {
  STR: 18,
  DEX: 14,
  CON: 14,
  INT: 10,
  WIS: 12,
  CHA: 14,
};

const CLASS_LEVEL = 6;
const SPELL_CASTING_ABILITY = "CHA";

const abilityModifier = (score) => Math.floor((score - 10) / 2);
const proficiencyBonusFor = (level) => Math.floor((level - 1) / 4) + 2;

const ABILITY_KEYS = Object.keys(BASE_SCORES);

export const computeDerived = (baseScores, abilityScoreModifiers = {}) => {
  const effectiveScores = Object.fromEntries(
    ABILITY_KEYS.map((key) => [
      key,
      (baseScores[key] ?? 0) + (abilityScoreModifiers[key] ?? 0),
    ]),
  );
  const modifiers = Object.fromEntries(
    ABILITY_KEYS.map((key) => [key, abilityModifier(effectiveScores[key])]),
  );
  const proficiencyBonus = proficiencyBonusFor(CLASS_LEVEL);
  const spellAttack = modifiers[SPELL_CASTING_ABILITY] + proficiencyBonus;
  const spellDc = 8 + modifiers[SPELL_CASTING_ABILITY] + proficiencyBonus;
  const tokenValues = {
    STR: modifiers.STR,
    DEX: modifiers.DEX,
    CON: modifiers.CON,
    INT: modifiers.INT,
    WIS: modifiers.WIS,
    CHA: modifiers.CHA,
    PROF: proficiencyBonus,
    SPELL_ATK: spellAttack,
    SPELL_DC: spellDc,
  };
  return {
    effectiveScores,
    modifiers,
    proficiencyBonus,
    spellAttack,
    spellDc,
    tokenValues,
  };
};

// Token values from the base scores (no condition mods), used as the
// formula fallback. Live values flow through CharacterStatsContext.
export const DEFAULT_TOKEN_VALUES = computeDerived(BASE_SCORES).tokenValues;
