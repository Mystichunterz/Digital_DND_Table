import HasteIcon from "../../assets/actions/items/POT_Potion_of_Speed_Unfaded_Icon.png";
import LethargicIcon from "../../assets/actions/spells/Bane_Unfaded_Icon.webp";
import AuraIcon from "../../assets/popups/conditions/120px-Aura_of_Protection_Icon.webp.png";
import CurseIcon from "../../assets/popups/features/120px-Bestow_Curse_Debuff_Ability_Icon.webp.png";

const evalEffect = (effect, context) =>
  typeof effect === "function" ? effect(context) : effect;

const evalText = (text, context) =>
  typeof text === "function" ? text(context) : text;

export const CONDITIONS = {
  hastened: {
    id: "hastened",
    title: "Hastened",
    subtitle: "Condition",
    icon: HasteIcon,
    text:
      "Creature has a +2 bonus to **Armour Class**, Advantage on Dexterity " +
      "**Saving Throws**, its **movement speed** is doubled, and it can take " +
      "one additional action per turn.\n\n" +
      "When the condition ends, the creature becomes **Lethargic**.",
    effects: {
      acBonus: 2,
      extraActions: 1,
      dexSaveAdv: true,
      speedMultiplier: 2,
    },
    onExpire: { condition: "lethargic", durationTurns: 1 },
  },
  lethargic: {
    id: "lethargic",
    title: "Lethargic",
    subtitle: "Condition",
    icon: LethargicIcon,
    text:
      "Drained from the rush of haste. The creature can't move or take " +
      "actions until the end of its next turn.",
    effects: {
      noActions: true,
      noMovement: true,
    },
    onExpire: null,
  },
  "aura-of-protection": {
    id: "aura-of-protection",
    title: "Aura of Protection",
    subtitle: "Paladin Aura",
    icon: AuraIcon,
    permanent: true,
    text: ({ modifiers }) =>
      "While conscious, you and friendly creatures within 10 ft. gain a " +
      `**+${Math.max(1, modifiers?.CHA ?? 0)}** bonus to all **Saving Throws** ` +
      "(your Charisma modifier, minimum +1).",
    effects: {
      savingThrowBonus: ({ modifiers }) =>
        Math.max(1, modifiers?.CHA ?? 0),
    },
    onExpire: null,
  },
  "divine-punishment": {
    id: "divine-punishment",
    title: "Divine Punishment",
    subtitle: "Curse",
    icon: CurseIcon,
    text:
      "Rhea's wrath sears your spirit. Your **Charisma** score is reduced by " +
      "**5**, weakening every spell, save, and roll that draws on your " +
      "force of personality.",
    effects: {
      abilityScoreModifiers: { CHA: -5 },
    },
    onExpire: null,
  },
};

export const PERMANENT_CONDITION_IDS = Object.values(CONDITIONS)
  .filter((condition) => condition.permanent)
  .map((condition) => condition.id);

export const getCondition = (id) => CONDITIONS[id] ?? null;

export const resolveConditionText = (condition, context = {}) =>
  evalText(condition?.text, context);

const sumStatic = (activeConditions, key) =>
  activeConditions.reduce((total, active) => {
    const value = CONDITIONS[active.id]?.effects?.[key];
    return total + (typeof value === "number" ? value : 0);
  }, 0);

export const sumAcBonus = (activeConditions) =>
  sumStatic(activeConditions, "acBonus");

export const sumExtraActions = (activeConditions) =>
  sumStatic(activeConditions, "extraActions");

export const sumSavingThrowBonus = (activeConditions, context = {}) =>
  activeConditions.reduce((total, active) => {
    const condition = CONDITIONS[active.id];
    const value = evalEffect(condition?.effects?.savingThrowBonus, context);
    return total + (typeof value === "number" ? value : 0);
  }, 0);

export const getActiveSavingThrowSources = (activeConditions, context = {}) =>
  activeConditions
    .map((entry) => CONDITIONS[entry.id])
    .filter(Boolean)
    .map((condition) => ({
      title: condition.title,
      bonus: evalEffect(condition.effects?.savingThrowBonus, context),
    }))
    .filter((row) => typeof row.bonus === "number" && row.bonus !== 0);

export const sumAbilityScoreModifiers = (activeConditions) => {
  const totals = { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };

  for (const active of activeConditions) {
    const mods = CONDITIONS[active.id]?.effects?.abilityScoreModifiers;

    if (!mods) {
      continue;
    }

    for (const [ability, delta] of Object.entries(mods)) {
      if (ability in totals && typeof delta === "number") {
        totals[ability] += delta;
      }
    }
  }

  return totals;
};

export const getActiveAbilityScoreSources = (activeConditions, ability) =>
  activeConditions
    .map((entry) => {
      const condition = CONDITIONS[entry.id];
      const delta = condition?.effects?.abilityScoreModifiers?.[ability];

      if (typeof delta !== "number" || delta === 0) {
        return null;
      }

      return { title: condition.title, delta };
    })
    .filter(Boolean);
