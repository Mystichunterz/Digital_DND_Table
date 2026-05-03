import { substituteTokens } from "./formulas";

const ROLL_KINDS = ["attack", "damage"];

const hasRoll = (action, kind) =>
  typeof action?.rolls?.[kind] === "string" && action.rolls[kind].trim() !== "";

const isWeaponAttackFormula = (formula) =>
  formula.includes("{STR}") && formula.includes("{PROF}");

export const pickRollKind = (action, event) => {
  if (event?.shiftKey && hasRoll(action, "damage")) {
    return "damage";
  }

  if (event?.shiftKey && !hasRoll(action, "damage") && hasRoll(action, "attack")) {
    return "attack";
  }

  for (const kind of ROLL_KINDS) {
    if (hasRoll(action, kind)) {
      return kind;
    }
  }

  return "attack";
};

const isWeaponAttackAction = (action) => {
  const attack = action?.rolls?.attack;
  return typeof attack === "string" && isWeaponAttackFormula(attack);
};

const applyGwm = (action, kind, resolved) => {
  if (!isWeaponAttackAction(action)) {
    return resolved;
  }

  if (kind === "attack") {
    return `${resolved} - 5`;
  }

  if (kind === "damage") {
    return `${resolved} + 10`;
  }

  return resolved;
};

export const toAvraeCommand = (action, kind, options = {}, tokenValues) => {
  const formula = action?.rolls?.[kind];

  if (typeof formula !== "string" || formula.trim() === "") {
    return "!roll EMPTY";
  }

  const trimmed = formula.trim();

  // Rider/appendix formulas (Bless, Hunter's Mark, etc.) start with "+"
  // and are meant to be pasted after an existing Discord roll line.
  if (trimmed.startsWith("+")) {
    return substituteTokens(trimmed, tokenValues);
  }

  const resolved = substituteTokens(trimmed, tokenValues);
  const adjusted = options.gwm ? applyGwm(action, kind, resolved) : resolved;

  return `!roll ${adjusted}`;
};
