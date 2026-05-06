export const SPELLBOOK_TABS = [
  {
    id: "paladin",
    label: "Paladin",
    getItems: (actions) =>
      actions.filter((action) => action.class === "paladin"),
  },
  {
    id: "sorcerer",
    label: "Sorcerer",
    getItems: (actions) =>
      actions.filter((action) => action.class === "sorcerer"),
  },
  {
    id: "common",
    label: "Common",
    getItems: (actions) =>
      actions.filter((action) => action.class === "common"),
  },
  {
    id: "reactions",
    label: "Reactions",
    getItems: (actions) =>
      actions.filter((action) => action.kind === "reaction"),
  },
];

export const SPELLBOOK_TIER_ORDER = ["C", "I", "II", "III", "IV", "V"];

export const SPELLBOOK_VIEWPORT_MARGIN = 12;
