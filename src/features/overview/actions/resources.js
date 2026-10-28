export const TIER_TO_SLOT_LEVEL = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
};

export const DEFAULT_RESOURCE_MAX = {
  action: 1,
  bonus: 1,
  reaction: 1,
  channelOath: 1,
  favouredByGods: 1,
  divineSense: 3,
  layOnHands: 30,
  sorceryPoints: 3,
  seraSneakAttack: 3,
  spellSlots: { 1: 4, 2: 3, 3: 3, 4: 0, 5: 0, 6: 0 },
};

export const buildInitialResources = (resourceMax) => ({
  action: resourceMax.action,
  bonus: resourceMax.bonus,
  reaction: resourceMax.reaction,
  channelOath: resourceMax.channelOath,
  favouredByGods: resourceMax.favouredByGods,
  divineSense: resourceMax.divineSense,
  layOnHands: resourceMax.layOnHands,
  sorceryPoints: resourceMax.sorceryPoints,
  seraSneakAttack: resourceMax.seraSneakAttack,
  spellSlots: { ...resourceMax.spellSlots },
});

export const clampResourceValue = (value, min, max) =>
  Math.min(Math.max(value, min), max);

export const isSpellAction = (action) =>
  action?.category === "paladin" ||
  (typeof action?.iconKey === "string" && action.iconKey.startsWith("spells/"));

export const canAffordAction = (item, resources) => {
  if (!item || item.toggle === "gwm") return true;

  if (item.kind === "action" && (resources.action ?? 0) <= 0) return false;
  if (item.kind === "bonus" && (resources.bonus ?? 0) <= 0) return false;
  if (item.kind === "reaction" && (resources.reaction ?? 0) <= 0) return false;

  if (isSpellAction(item) && item.tier && item.tier !== "C") {
    const slotLevel = TIER_TO_SLOT_LEVEL[item.tier];
    if (!slotLevel || (resources.spellSlots?.[slotLevel] ?? 0) <= 0)
      return false;
  }

  return true;
};
