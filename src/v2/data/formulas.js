import {
  MODIFIERS,
  PROFICIENCY_BONUS,
  SPELL_ATTACK,
  SPELL_DC,
} from "./characterStats";

const TOKEN_VALUES = {
  STR: MODIFIERS.STR,
  DEX: MODIFIERS.DEX,
  CON: MODIFIERS.CON,
  INT: MODIFIERS.INT,
  WIS: MODIFIERS.WIS,
  CHA: MODIFIERS.CHA,
  PROF: PROFICIENCY_BONUS,
  SPELL_ATK: SPELL_ATTACK,
  SPELL_DC,
};

const TOKEN_PATTERN = /\{(\w+)\}/g;

export const substituteTokens = (formula) => {
  if (typeof formula !== "string") {
    return "";
  }

  return formula.replace(TOKEN_PATTERN, (match, token) => {
    const value = TOKEN_VALUES[token];
    return value === undefined ? match : String(value);
  });
};

const TERM_PATTERN = /([+-]?)\s*(\d*d\d+|\d+)/gi;

// Parses a (token-substituted) formula like "1d10 + 4 + 2d8" into { min, max }.
// Leading "+" or "-" on the formula is treated as a sign for the first term.
export const formulaRange = (formula) => {
  if (typeof formula !== "string" || formula.trim() === "") {
    return { min: 0, max: 0 };
  }

  let min = 0;
  let max = 0;
  TERM_PATTERN.lastIndex = 0;

  let match;
  while ((match = TERM_PATTERN.exec(formula)) !== null) {
    const sign = match[1] === "-" ? -1 : 1;
    const term = match[2];
    const diceMatch = /^(\d*)d(\d+)$/i.exec(term);

    if (diceMatch) {
      const count = parseInt(diceMatch[1] || "1", 10);
      const sides = parseInt(diceMatch[2], 10);
      min += sign * count;
      max += sign * count * sides;
    } else {
      const flat = parseInt(term, 10);

      if (!Number.isNaN(flat)) {
        min += sign * flat;
        max += sign * flat;
      }
    }
  }

  return { min, max };
};
