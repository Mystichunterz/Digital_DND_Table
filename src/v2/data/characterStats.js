export const ABILITY_SCORES = {
  STR: 18,
  DEX: 14,
  CON: 14,
  INT: 10,
  WIS: 12,
  CHA: 14,
};

export const CLASS_LEVEL = 6;

const abilityModifier = (score) => Math.floor((score - 10) / 2);

export const MODIFIERS = Object.fromEntries(
  Object.entries(ABILITY_SCORES).map(([key, score]) => [
    key,
    abilityModifier(score),
  ]),
);

export const PROFICIENCY_BONUS = Math.floor((CLASS_LEVEL - 1) / 4) + 2;

// Paladin spellcasting (CHA-based)
export const SPELL_CASTING_ABILITY = "CHA";
export const SPELL_ATTACK =
  MODIFIERS[SPELL_CASTING_ABILITY] + PROFICIENCY_BONUS;
export const SPELL_DC = 8 + MODIFIERS[SPELL_CASTING_ABILITY] + PROFICIENCY_BONUS;
