export const BASE_SCORES = {
  STR: 18,
  DEX: 14,
  CON: 14,
  INT: 10,
  WIS: 12,
  CHA: 14,
};

export const CLASS_LEVEL = 6;
export const SPELL_CASTING_ABILITY = "CHA";

export const abilityModifier = (score) => Math.floor((score - 10) / 2);
export const proficiencyBonusFor = (level) => Math.floor((level - 1) / 4) + 2;

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

// Back-compat exports computed from default base scores (no condition mods).
// Live values flow through CharacterStatsContext at runtime.
const DEFAULTS = computeDerived(BASE_SCORES);
export const ABILITY_SCORES = BASE_SCORES;
export const MODIFIERS = DEFAULTS.modifiers;
export const PROFICIENCY_BONUS = DEFAULTS.proficiencyBonus;
export const SPELL_ATTACK = DEFAULTS.spellAttack;
export const SPELL_DC = DEFAULTS.spellDc;
export const DEFAULT_TOKEN_VALUES = DEFAULTS.tokenValues;
