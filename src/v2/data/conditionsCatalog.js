import HasteIcon from "../../assets/actions/items/POT_Potion_of_Speed_Unfaded_Icon.png";
import LethargicIcon from "../../assets/actions/spells/Bane_Unfaded_Icon.webp";
import AuraIcon from "../../assets/popups/conditions/120px-Aura_of_Protection_Icon.webp.png";
import { MODIFIERS } from "./characterStats";

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
    text:
      "While conscious, you and friendly creatures within 10 ft. gain a " +
      `**+${MODIFIERS.CHA}** bonus to all **Saving Throws** (your Charisma ` +
      "modifier, minimum +1).",
    effects: {
      savingThrowBonus: Math.max(1, MODIFIERS.CHA),
    },
    onExpire: null,
  },
};

export const PERMANENT_CONDITION_IDS = Object.values(CONDITIONS)
  .filter((condition) => condition.permanent)
  .map((condition) => condition.id);

export const getCondition = (id) => CONDITIONS[id] ?? null;

const sumEffect = (activeConditions, key) =>
  activeConditions.reduce((total, active) => {
    const condition = CONDITIONS[active.id];
    const value = condition?.effects?.[key];
    return total + (typeof value === "number" ? value : 0);
  }, 0);

export const sumAcBonus = (activeConditions) =>
  sumEffect(activeConditions, "acBonus");

export const sumExtraActions = (activeConditions) =>
  sumEffect(activeConditions, "extraActions");

export const sumSavingThrowBonus = (activeConditions) =>
  sumEffect(activeConditions, "savingThrowBonus");

export const getActiveSavingThrowSources = (activeConditions) =>
  activeConditions
    .map((entry) => CONDITIONS[entry.id])
    .filter((condition) => condition?.effects?.savingThrowBonus)
    .map((condition) => ({
      title: condition.title,
      bonus: condition.effects.savingThrowBonus,
    }));
