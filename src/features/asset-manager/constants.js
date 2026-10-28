export const CATEGORY_OPTIONS = [
  { value: "common", label: "Common" },
  { value: "paladin", label: "Paladin" },
  { value: "items", label: "Items" },
  { value: "passives", label: "Passives" },
  { value: "custom", label: "Custom" },
];

export const SECTION_OPTIONS = [
  { value: "mobility", label: "Mobility" },
  { value: "offense", label: "Offense" },
  { value: "support", label: "Support" },
];

export const KIND_OPTIONS = [
  { value: "action", label: "Action" },
  { value: "bonus", label: "Bonus" },
  { value: "reaction", label: "Reaction" },
  { value: "utility", label: "Utility" },
];

export const TIER_OPTIONS = [
  { value: "C", label: "C" },
  { value: "I", label: "I" },
  { value: "II", label: "II" },
  { value: "III", label: "III" },
  { value: "IV", label: "IV" },
  { value: "V", label: "V" },
];

export const TONE_OPTIONS = [
  { value: "steel", label: "Steel" },
  { value: "red", label: "Red" },
  { value: "gold", label: "Gold" },
  { value: "blue", label: "Blue" },
  { value: "purple", label: "Purple" },
  { value: "green", label: "Green" },
  { value: "neutral", label: "Neutral" },
];

export const ICON_GROUP_OPTIONS = [
  { value: "common", label: "Common" },
  { value: "weapons", label: "Weapons" },
  { value: "spells", label: "Spells" },
  { value: "items", label: "Items" },
  { value: "passives", label: "Passives" },
  { value: "custom", label: "Custom" },
];

export const CATEGORY_TO_GROUP = {
  common: "common",
  paladin: "spells",
  items: "items",
  passives: "passives",
  custom: "custom",
};

export const createBlankAbility = () => ({
  id: "",
  name: "",
  short: "",
  category: "common",
  section: "offense",
  kind: "action",
  tier: "I",
  tone: "steel",
  keybind: "",
  icon: "",
});

export const toAbilityId = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

export const readApiErrorMessage = async (response) => {
  try {
    const payload = await response.json();

    if (payload && typeof payload.message === "string") {
      return payload.message;
    }
  } catch {
    // fall through to default message
  }

  return `Request failed with status ${response.status}.`;
};
