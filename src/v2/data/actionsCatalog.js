import manifest from "./actions-manifest.json";

export const CATEGORY_IDS = [
  "common",
  "paladin",
  "items",
  "passives",
  "custom",
];

const iconModules = import.meta.glob(
  "../../assets/actions/**/*.{webp,png,jpg,jpeg}",
  {
    eager: true,
    import: "default",
  },
);

const iconByKey = Object.fromEntries(
  Object.entries(iconModules).map(([filePath, iconUrl]) => {
    const iconKey = filePath.replace("../../assets/actions/", "");
    return [iconKey, iconUrl];
  }),
);

const INITIAL_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "from",
  "in",
  "of",
  "on",
  "the",
  "to",
]);

const getInitialsFromName = (value) => {
  const words = String(value ?? "")
    .replace(/[()]/g, " ")
    .split(/[\s-]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (!words.length) {
    return "??";
  }

  const significantWords = words.filter(
    (word) => !INITIAL_STOP_WORDS.has(word.toLowerCase()),
  );
  const sourceWords = significantWords.length ? significantWords : words;

  if (sourceWords.length === 1) {
    return sourceWords[0].slice(0, 2).toUpperCase();
  }

  return `${sourceWords[0][0]}${sourceWords[1][0]}`.toUpperCase();
};

const normalizeAbility = (ability) => {
  const iconKey = typeof ability.icon === "string" ? ability.icon : null;
  const resolvedIcon =
    iconKey && iconByKey[iconKey] ? iconByKey[iconKey] : null;
  const fallbackIconText = resolvedIcon
    ? null
    : ability.category === "paladin"
      ? getInitialsFromName(ability.name)
      : String(ability.short ?? "")
          .trim()
          .toUpperCase() || getInitialsFromName(ability.name);

  return {
    ...ability,
    iconKey,
    icon: resolvedIcon,
    fallbackIconText,
  };
};

const manifestAbilities = Array.isArray(manifest?.abilities)
  ? manifest.abilities
  : [];

export const ACTIONS = manifestAbilities.map(normalizeAbility);

export const ACTION_LIBRARY = CATEGORY_IDS.reduce((library, categoryId) => {
  library[categoryId] = ACTIONS.filter(
    (ability) => ability.category === categoryId,
  );
  return library;
}, {});

export const ACTION_MANIFEST_VERSION = manifest?.version ?? 1;
