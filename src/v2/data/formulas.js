import { DEFAULT_TOKEN_VALUES } from "./characterStats";

const TOKEN_PATTERN = /\{(\w+)\}/g;

export const TOKEN_LABELS = {
  STR: "Strength Modifier",
  DEX: "Dexterity Modifier",
  CON: "Constitution Modifier",
  INT: "Intelligence Modifier",
  WIS: "Wisdom Modifier",
  CHA: "Charisma Modifier",
  PROF: "Proficiency Bonus",
  SPELL_ATK: "Spell Attack",
  SPELL_DC: "Spell Save DC",
};

export const substituteTokens = (formula, tokenValues = DEFAULT_TOKEN_VALUES) => {
  if (typeof formula !== "string") {
    return "";
  }

  return formula.replace(TOKEN_PATTERN, (match, token) => {
    const value = tokenValues?.[token];
    return value === undefined ? match : String(value);
  });
};

const TERM_PATTERN = /([+-]?)\s*(\d*d\d+|\d+)/gi;
const TYPED_TERM_PATTERN = /([+-])?\s*(\d*d\d+|\{\w+\}|\d+)/gi;

// Parses a formula like "1d10+{STR}" into typed terms preserving original
// token names. Returns [{ kind: "dice"|"token"|"flat", sign, ... }]. Dice
// terms have `text` (e.g. "1d10"); token terms have `tokenKey`, `label`, and
// `value` (substituted from tokenValues); flat terms have `value`.
export const parseFormulaTerms = (formula, tokenValues = DEFAULT_TOKEN_VALUES) => {
  if (typeof formula !== "string" || formula.trim() === "") {
    return [];
  }

  const terms = [];
  TYPED_TERM_PATTERN.lastIndex = 0;

  let match;
  while ((match = TYPED_TERM_PATTERN.exec(formula)) !== null) {
    const sign = match[1] === "-" ? "-" : "+";
    const raw = match[2];
    const diceMatch = /^(\d*)d(\d+)$/i.exec(raw);
    const tokenMatch = /^\{(\w+)\}$/.exec(raw);

    if (diceMatch) {
      terms.push({ kind: "dice", sign, text: raw });
    } else if (tokenMatch) {
      const tokenKey = tokenMatch[1];
      const value = tokenValues?.[tokenKey];
      terms.push({
        kind: "token",
        sign,
        tokenKey,
        label: TOKEN_LABELS[tokenKey] ?? tokenKey,
        value: value === undefined ? raw : String(value),
      });
    } else {
      terms.push({ kind: "flat", sign, value: raw });
    }
  }

  return terms;
};

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
