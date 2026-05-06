import { ACTION_LIBRARY } from "../../../../data/actionsCatalog";

export const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "action", label: "Act" },
  { id: "bonus", label: "Bon" },
  { id: "reaction", label: "Rct" },
  { id: "utility", label: "Utl" },
  { id: "C", label: "C" },
  { id: "I", label: "I" },
  { id: "II", label: "II" },
  { id: "III", label: "III" },
  { id: "IV", label: "IV" },
  { id: "V", label: "V" },
];

export const SECTION_CONFIG = [
  { id: "common", categoryId: "common", label: "Common", defaultColumns: 4 },
  {
    id: "paladin",
    categoryId: "paladin",
    label: "Paladin",
    defaultColumns: 5,
  },
  { id: "items", categoryId: "items", label: "Items", defaultColumns: 4 },
];

export const CATEGORY_TABS = SECTION_CONFIG.map((section) => ({
  id: section.id,
  label: section.label,
}));

export const TOTAL_SECTION_COLUMNS = SECTION_CONFIG.reduce(
  (sum, section) => sum + section.defaultColumns,
  0,
);

export const DEFAULT_SECTION_COLUMNS = SECTION_CONFIG.map(
  (section) => section.defaultColumns,
);

export const SECTION_SLOT_ROWS = 5;
export const SECTION_SLOT_COUNT = TOTAL_SECTION_COLUMNS * SECTION_SLOT_ROWS;
export const SECTION_IDS = SECTION_CONFIG.map((section) => section.id);

const LEGACY_LAYOUT_SECTION_IDS = ["mobility", "offense", "support"];

export const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

export const buildInitialSectionLayout = (sectionConfig) => {
  const actions = ACTION_LIBRARY[sectionConfig.categoryId] ?? [];
  const slots = Array(SECTION_SLOT_COUNT).fill(null);

  actions.forEach((action, index) => {
    if (index < SECTION_SLOT_COUNT) {
      slots[index] = action.id;
    }
  });

  return slots;
};

export const createInitialSectionLayouts = () => {
  const layouts = {};

  SECTION_CONFIG.forEach((section) => {
    layouts[section.id] = buildInitialSectionLayout(section);
  });

  return layouts;
};

const getImportedSlots = (importedSectionLayout) => {
  if (Array.isArray(importedSectionLayout)) {
    return importedSectionLayout;
  }

  if (!importedSectionLayout || typeof importedSectionLayout !== "object") {
    return [];
  }

  const legacySlots = [];

  LEGACY_LAYOUT_SECTION_IDS.forEach((legacySectionId) => {
    const maybeSlots = importedSectionLayout[legacySectionId];

    if (Array.isArray(maybeSlots)) {
      legacySlots.push(...maybeSlots);
    }
  });

  return legacySlots;
};

const normalizeImportedSectionLayout = (
  sectionConfig,
  importedSectionLayout,
) => {
  const actions = ACTION_LIBRARY[sectionConfig.categoryId] ?? [];
  const allowedActionIds = new Set(actions.map((action) => action.id));
  const importedSlots = getImportedSlots(importedSectionLayout);
  const normalizedSlots = Array(SECTION_SLOT_COUNT).fill(null);

  for (let index = 0; index < SECTION_SLOT_COUNT; index += 1) {
    const maybeActionId = importedSlots[index];

    if (
      typeof maybeActionId === "string" &&
      allowedActionIds.has(maybeActionId)
    ) {
      normalizedSlots[index] = maybeActionId;
    }
  }

  const seenActionIds = new Set();

  for (let index = 0; index < normalizedSlots.length; index += 1) {
    const actionId = normalizedSlots[index];

    if (!actionId || seenActionIds.has(actionId)) {
      normalizedSlots[index] = null;
      continue;
    }

    seenActionIds.add(actionId);
  }

  const missingActionIds = actions
    .map((action) => action.id)
    .filter((actionId) => !seenActionIds.has(actionId));

  missingActionIds.forEach((actionId) => {
    const slotIndex = normalizedSlots.indexOf(null);

    if (slotIndex !== -1) {
      normalizedSlots[slotIndex] = actionId;
      seenActionIds.add(actionId);
    }
  });

  return normalizedSlots;
};

export const normalizeImportedLayouts = (importedLayouts) => {
  const baseLayouts = createInitialSectionLayouts();

  if (!importedLayouts || typeof importedLayouts !== "object") {
    return baseLayouts;
  }

  SECTION_CONFIG.forEach((section) => {
    baseLayouts[section.id] = normalizeImportedSectionLayout(
      section,
      importedLayouts[section.id] ?? importedLayouts[section.categoryId],
    );
  });

  return baseLayouts;
};
