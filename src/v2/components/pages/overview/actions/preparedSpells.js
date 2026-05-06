import { ACTIONS } from "../../../../data/actionsCatalog";
import { SPELLBOOK_TABS as SPELLBOOK_TAB_CONFIGS } from "../../../../data/spellbookTabs";

export const PREPARED_TOGGLE_ROW_KEYS = new Set(["tier-1", "tier-2"]);

export const DEFAULT_PREPARED_SPELL_IDS = { paladin: [] };

export const PREPARABLE_CLASS_IDS = new Set(
  Object.keys(DEFAULT_PREPARED_SPELL_IDS),
);

export const sanitizePreparedSpellIds = (raw, preparedLimitByClass = {}) => {
  const validClasses = Object.keys(DEFAULT_PREPARED_SPELL_IDS);
  const allowedActionIdByClass = validClasses.reduce((map, classId) => {
    map[classId] = new Set(
      ACTIONS.filter(
        (action) =>
          action.class === classId && action.spellbookRow !== "class-action",
      ).map((action) => action.id),
    );
    return map;
  }, {});

  const result = { ...DEFAULT_PREPARED_SPELL_IDS };

  if (raw && typeof raw === "object") {
    validClasses.forEach((classId) => {
      const incoming = Array.isArray(raw[classId]) ? raw[classId] : [];
      const allowedIds = allowedActionIdByClass[classId];
      const seen = new Set();
      const filtered = [];

      for (const candidate of incoming) {
        if (
          typeof candidate === "string" &&
          allowedIds.has(candidate) &&
          !seen.has(candidate)
        ) {
          filtered.push(candidate);
          seen.add(candidate);
        }
      }

      const cap = preparedLimitByClass[classId];

      result[classId] =
        typeof cap === "number" ? filtered.slice(0, cap) : filtered;
    });
  }

  return result;
};

export const DEFAULT_PREPARED_LIMITS_BY_CLASS = SPELLBOOK_TAB_CONFIGS.reduce(
  (map, tab) => {
    if (typeof tab.preparedLimit === "number") {
      map[tab.id] = tab.preparedLimit;
    }
    return map;
  },
  {},
);

export const sanitizePreparedLimitsByClass = (raw) => {
  const result = { ...DEFAULT_PREPARED_LIMITS_BY_CLASS };

  if (raw && typeof raw === "object") {
    Object.keys(DEFAULT_PREPARED_LIMITS_BY_CLASS).forEach((classId) => {
      const candidate = raw[classId];
      if (typeof candidate === "number" && Number.isFinite(candidate)) {
        result[classId] = Math.max(0, Math.floor(candidate));
      }
    });
  }

  return result;
};

export const PREPARED_TAB_LABELS_BY_CLASS = SPELLBOOK_TAB_CONFIGS.reduce(
  (map, tab) => {
    map[tab.id] = tab.label;
    return map;
  },
  {},
);

export const requiresPreparation = (action) =>
  PREPARABLE_CLASS_IDS.has(action?.class) &&
  PREPARED_TOGGLE_ROW_KEYS.has(action?.spellbookRow);

export const isActionLockedForPreparation = (action, preparedSpellIds) => {
  if (!action || !requiresPreparation(action)) {
    return false;
  }
  const classId = action.class;
  const preparedList = preparedSpellIds?.[classId] ?? [];
  return !preparedList.includes(action.id);
};
