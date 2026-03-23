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

const normalizeAbility = (ability) => {
  const iconKey = typeof ability.icon === "string" ? ability.icon : null;

  return {
    ...ability,
    iconKey,
    icon: iconKey && iconByKey[iconKey] ? iconByKey[iconKey] : null,
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
