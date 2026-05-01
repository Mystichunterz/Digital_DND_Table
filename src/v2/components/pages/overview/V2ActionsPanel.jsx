import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ACTIONS, ACTION_LIBRARY } from "../../../data/actionsCatalog";
import {
  SPELLBOOK_TABS as SPELLBOOK_TAB_CONFIGS,
  getTabById,
} from "../../../data/spellbookTabs";
import SpellHoverPopup from "../../popups/SpellHoverPopup";
import MetamagicHoverPopup from "../../popups/MetamagicHoverPopup";
import SpellbookRow from "../../popups/SpellbookRow";
import V2ResourcePips from "./V2ResourcePips";
import TwinnedSpellIcon from "../../../../assets/actions/metamagic/Metamagic_Twinned_Spell_Icon.webp";
import DistantSpellIcon from "../../../../assets/actions/metamagic/Metamagic_Distant_Spell_Icon.webp";
import QuickenedSpellIcon from "../../../../assets/actions/metamagic/Metamagic_Quickened_Spell_Icon.webp";
import SubtleSpellIcon from "../../../../assets/actions/metamagic/Metamagic_Subtle_Spell_Icon.webp";
import HeightenedSpellIcon from "../../../../assets/actions/metamagic/Metamagic_Heightened_Spell_Icon.webp";
import ExtendedSpellIcon from "../../../../assets/actions/metamagic/Metamagic_Extended_Spell_Icon.webp";
import EmpoweredSpellIcon from "../../../../assets/actions/metamagic/Metamagic_Empowered_Spell_Icon.webp";
import CarefulSpellIcon from "../../../../assets/actions/metamagic/Metamagic_Careful_Spell_Icon.webp";
import SeekingSpellIcon from "../../../../assets/actions/metamagic/Seeking_Spell_Icon.webp";
import SpellSlotIcon from "../../../../assets/resources/spell_slot.png";

const PERSISTED_CHARACTER_ID = "default";
const PERSIST_DEBOUNCE_MS = 500;

const TIER_TO_SLOT_LEVEL = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 };

const DEFAULT_RESOURCE_MAX = {
  action: 1,
  bonus: 1,
  reaction: 1,
  channelOath: 1,
  divineSense: 3,
  layOnHands: 30,
  sorceryPoints: 3,
  spellSlots: { 1: 4, 2: 3, 3: 3, 4: 0, 5: 0, 6: 0 },
};

const buildInitialResources = (resourceMax) => ({
  action: resourceMax.action,
  bonus: resourceMax.bonus,
  reaction: resourceMax.reaction,
  channelOath: resourceMax.channelOath,
  divineSense: resourceMax.divineSense,
  layOnHands: resourceMax.layOnHands,
  sorceryPoints: resourceMax.sorceryPoints,
  spellSlots: { ...resourceMax.spellSlots },
});

const clampResourceValue = (value, min, max) =>
  Math.min(Math.max(value, min), max);

const FILTER_TABS = [
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

const SECTION_CONFIG = [
  { id: "common", categoryId: "common", label: "Common", defaultColumns: 4 },
  {
    id: "paladin",
    categoryId: "paladin",
    label: "Paladin",
    defaultColumns: 5,
  },
  { id: "items", categoryId: "items", label: "Items", defaultColumns: 4 },
];

const CATEGORY_TABS = SECTION_CONFIG.map((section) => ({
  id: section.id,
  label: section.label,
}));

const TOTAL_SECTION_COLUMNS = SECTION_CONFIG.reduce(
  (sum, section) => sum + section.defaultColumns,
  0,
);

const DEFAULT_SECTION_COLUMNS = SECTION_CONFIG.map(
  (section) => section.defaultColumns,
);
const SECTION_SLOT_ROWS = 5;
const SECTION_SLOT_COUNT = TOTAL_SECTION_COLUMNS * SECTION_SLOT_ROWS;
const SECTION_IDS = SECTION_CONFIG.map((section) => section.id);
const LEGACY_LAYOUT_SECTION_IDS = ["mobility", "offense", "support"];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const buildInitialSectionLayout = (sectionConfig) => {
  const actions = ACTION_LIBRARY[sectionConfig.categoryId] ?? [];
  const slots = Array(SECTION_SLOT_COUNT).fill(null);

  actions.forEach((action, index) => {
    if (index < SECTION_SLOT_COUNT) {
      slots[index] = action.id;
    }
  });

  return slots;
};

const createInitialSectionLayouts = () => {
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

const normalizeImportedLayouts = (importedLayouts) => {
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

const METAMAGIC_SLOT_COUNT = 10;

const METAMAGIC_OPTIONS = [
  {
    id: "twinned-spell",
    name: "Twinned Spell",
    icon: TwinnedSpellIcon,
    description:
      "Spells that only target 1 creature can target an additional creature.\n\nFor spells that don't shoot a projectile, the targets need to be close enough together.",
    cost: "Costs 1 Sorcery Point per spell slot level used. Cantrips also cost 1 Sorcery Point.",
  },
  {
    id: "distant-spell",
    name: "Distant Spell",
    icon: DistantSpellIcon,
    description:
      "Extends the range of a spell by 50%. Melee spells have their range increased to 9 m / 30 ft.",
    cost: "Costs 1 Sorcery Point.",
  },
  {
    id: "quickened-spell",
    name: "Quickened Spell",
    icon: QuickenedSpellIcon,
    description:
      "Spells that take an Action to cast take a Bonus Action instead.",
    cost: "Costs 3 Sorcery Points.",
  },
  {
    id: "subtle-spell",
    name: "Subtle Spell",
    icon: SubtleSpellIcon,
    description: "You can cast spells while Silenced.",
    cost: "Costs 1 Sorcery Point.",
  },
  {
    id: "heightened-spell",
    name: "Heightened Spell",
    icon: HeightenedSpellIcon,
    description:
      "Targets of spells that require Saving Throws have Disadvantage on their first Saving Throw against the spell.",
    cost: "Costs 3 Sorcery Points.",
  },
  {
    id: "extended-spell",
    name: "Extended Spell",
    icon: ExtendedSpellIcon,
    description:
      "Doubles the duration of Conditions, summons, and surfaces caused by spells, up to a maximum of 24 turns.",
    cost: "Costs 1 Sorcery Point.",
  },
  {
    id: "empowered-spell",
    name: "Empowered Spell",
    icon: EmpoweredSpellIcon,
    description:
      "Reroll a number of damage dice up to your Charisma modifier when you cast a spell. You must use the new rolls.",
    cost: "Costs 1 Sorcery Point.",
  },
  {
    id: "careful-spell",
    name: "Careful Spell",
    icon: CarefulSpellIcon,
    description:
      "Allies automatically succeed Saving Throws against spells that require them.",
    cost: "Costs 1 Sorcery Point.",
  },
  {
    id: "seeking-spell",
    name: "Seeking Spell",
    icon: SeekingSpellIcon,
    description:
      "If a Spell Attack misses, you can reroll the Attack Roll once. You must use the new roll.",
    cost: "Costs 2 Sorcery Points.",
  },
];

const SPELLBOOK_TABS = [
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

const SPELLBOOK_TIER_ORDER = ["C", "I", "II", "III", "IV", "V"];

const TIER_NUMERAL = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI" };

const romanizeTier = (tier) => TIER_NUMERAL[tier] ?? String(tier);

const isSpellAction = (action) =>
  action?.category === "paladin" ||
  (typeof action?.iconKey === "string" && action.iconKey.startsWith("spells/"));
const SPELLBOOK_VIEWPORT_MARGIN = 12;

const V2ActionsPanel = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sectionColumns, setSectionColumns] = useState(DEFAULT_SECTION_COLUMNS);
  const [draggedDivider, setDraggedDivider] = useState(null);
  const [dragPreviewRatio, setDragPreviewRatio] = useState(null);
  const [sectionLayouts, setSectionLayouts] = useState(
    createInitialSectionLayouts,
  );
  const [draggedAction, setDraggedAction] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [isSpellbookOpen, setIsSpellbookOpen] = useState(false);
  const [activeSpellbookTab, setActiveSpellbookTab] = useState("paladin");
  const [spellbookPosition, setSpellbookPosition] = useState(null);
  const [spellbookDragState, setSpellbookDragState] = useState(null);
  const [layoutTransferMessage, setLayoutTransferMessage] = useState(null);
  const [resourceMax, setResourceMax] = useState(DEFAULT_RESOURCE_MAX);
  const [resources, setResources] = useState(() =>
    buildInitialResources(DEFAULT_RESOURCE_MAX),
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const gridClusterRef = useRef(null);
  const layoutFileInputRef = useRef(null);
  const spellbookPopupRef = useRef(null);

  const clampSpellbookPosition = useCallback((left, top) => {
    const popupElement = spellbookPopupRef.current;
    const popupWidth =
      popupElement?.offsetWidth ?? Math.max(320, window.innerWidth * 0.94);
    const popupHeight =
      popupElement?.offsetHeight ?? Math.max(240, window.innerHeight * 0.78);
    const maxLeft = Math.max(
      SPELLBOOK_VIEWPORT_MARGIN,
      window.innerWidth - popupWidth - SPELLBOOK_VIEWPORT_MARGIN,
    );
    const maxTop = Math.max(
      SPELLBOOK_VIEWPORT_MARGIN,
      window.innerHeight - popupHeight - SPELLBOOK_VIEWPORT_MARGIN,
    );

    return {
      left: clamp(left, SPELLBOOK_VIEWPORT_MARGIN, maxLeft),
      top: clamp(top, SPELLBOOK_VIEWPORT_MARGIN, maxTop),
    };
  }, []);

  const getPointerRatio = useCallback((pointerX) => {
    const cluster = gridClusterRef.current;

    if (!cluster) {
      return null;
    }

    const bounds = cluster.getBoundingClientRect();

    if (bounds.width <= 0) {
      return null;
    }

    return clamp((pointerX - bounds.left) / bounds.width, 0, 1);
  }, []);

  const getSnappedColumns = useCallback(
    (ratio, columns) => {
      if (ratio === null) {
        return columns;
      }

      const [firstBoundary, secondBoundary] = [
        columns[0],
        columns[0] + columns[1],
      ];

      const targetBoundary = Math.round(ratio * TOTAL_SECTION_COLUMNS);

      if (draggedDivider === 0) {
        const nextFirstBoundary = clamp(targetBoundary, 0, secondBoundary);

        return [
          nextFirstBoundary,
          secondBoundary - nextFirstBoundary,
          TOTAL_SECTION_COLUMNS - secondBoundary,
        ];
      }

      if (draggedDivider === 1) {
        const nextSecondBoundary = clamp(
          targetBoundary,
          firstBoundary,
          TOTAL_SECTION_COLUMNS,
        );

        return [
          firstBoundary,
          nextSecondBoundary - firstBoundary,
          TOTAL_SECTION_COLUMNS - nextSecondBoundary,
        ];
      }

      return columns;
    },
    [draggedDivider],
  );

  useEffect(() => {
    let isCancelled = false;

    const hydrate = async () => {
      try {
        const response = await fetch(
          `/api/state/${PERSISTED_CHARACTER_ID}`,
        );

        if (isCancelled) {
          return;
        }

        if (response.ok) {
          const saved = await response.json();

          if (isCancelled) {
            return;
          }

          if (saved && typeof saved === "object") {
            if (saved.resourceMax && typeof saved.resourceMax === "object") {
              setResourceMax({
                ...DEFAULT_RESOURCE_MAX,
                ...saved.resourceMax,
                spellSlots: {
                  ...DEFAULT_RESOURCE_MAX.spellSlots,
                  ...(saved.resourceMax.spellSlots ?? {}),
                },
              });
            }
            if (saved.resources && typeof saved.resources === "object") {
              setResources({
                ...buildInitialResources(DEFAULT_RESOURCE_MAX),
                ...saved.resources,
                spellSlots: {
                  ...DEFAULT_RESOURCE_MAX.spellSlots,
                  ...(saved.resources.spellSlots ?? {}),
                },
              });
            }
            if (saved.sectionLayouts) {
              setSectionLayouts(normalizeImportedLayouts(saved.sectionLayouts));
            }
            if (
              Array.isArray(saved.sectionColumns) &&
              saved.sectionColumns.length === DEFAULT_SECTION_COLUMNS.length
            ) {
              setSectionColumns(saved.sectionColumns);
            }
          }
        }
      } catch {
        // Server unavailable — fall back to defaults silently.
      } finally {
        if (!isCancelled) {
          setIsHydrated(true);
        }
      }
    };

    hydrate();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      fetch(`/api/state/${PERSISTED_CHARACTER_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resources,
          resourceMax,
          sectionLayouts,
          sectionColumns,
        }),
      }).catch(() => {
        // Server unavailable — drop the write silently.
      });
    }, PERSIST_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isHydrated, resources, resourceMax, sectionLayouts, sectionColumns]);

  useEffect(() => {
    if (draggedDivider === null) {
      return undefined;
    }

    const handlePointerMove = (event) => {
      setDragPreviewRatio(getPointerRatio(event.clientX));
    };

    const stopDragging = () => {
      setSectionColumns((currentColumns) => {
        const nextColumns = getSnappedColumns(dragPreviewRatio, currentColumns);

        if (
          nextColumns[0] === currentColumns[0] &&
          nextColumns[1] === currentColumns[1] &&
          nextColumns[2] === currentColumns[2]
        ) {
          return currentColumns;
        }

        return nextColumns;
      });

      setDraggedDivider(null);
      setDragPreviewRatio(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [draggedDivider, dragPreviewRatio, getPointerRatio, getSnappedColumns]);

  useEffect(() => {
    if (!isSpellbookOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsSpellbookOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isSpellbookOpen]);

  useEffect(() => {
    if (!spellbookDragState) {
      return undefined;
    }

    const handlePointerMove = (event) => {
      const nextLeft = event.clientX - spellbookDragState.offsetX;
      const nextTop = event.clientY - spellbookDragState.offsetY;

      setSpellbookPosition(clampSpellbookPosition(nextLeft, nextTop));
    };

    const stopDragging = () => {
      setSpellbookDragState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [spellbookDragState, clampSpellbookPosition]);

  useEffect(() => {
    if (!isSpellbookOpen) {
      return;
    }

    setSpellbookPosition((currentPosition) => {
      if (!currentPosition) {
        return currentPosition;
      }

      return clampSpellbookPosition(currentPosition.left, currentPosition.top);
    });
  }, [isSpellbookOpen, clampSpellbookPosition]);

  useEffect(() => {
    if (!isSpellbookOpen) {
      return undefined;
    }

    const handleResize = () => {
      setSpellbookPosition((currentPosition) => {
        if (!currentPosition) {
          return currentPosition;
        }

        return clampSpellbookPosition(
          currentPosition.left,
          currentPosition.top,
        );
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isSpellbookOpen, clampSpellbookPosition]);

  const startDividerDrag = (dividerIndex, event) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    setDragPreviewRatio(getPointerRatio(event.clientX));
    setDraggedDivider(dividerIndex);
  };

  const resetDividers = () => {
    setSectionColumns(DEFAULT_SECTION_COLUMNS);
  };

  const handleSpellbookHeaderPointerDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();

    const popupElement = spellbookPopupRef.current;

    if (!popupElement) {
      return;
    }

    const popupRect = popupElement.getBoundingClientRect();
    const basePosition = spellbookPosition ?? {
      left: popupRect.left,
      top: popupRect.top,
    };

    if (!spellbookPosition) {
      setSpellbookPosition(basePosition);
    }

    setSpellbookDragState({
      offsetX: event.clientX - basePosition.left,
      offsetY: event.clientY - basePosition.top,
    });
  };

  const exportLayoutAsJson = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[.:]/g, "-");
    const exportPayload = {
      type: "v2-actions-layout",
      version: 2,
      exportedAt: now.toISOString(),
      sectionLayouts,
    };
    const jsonBlob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(jsonBlob);
    const downloadLink = document.createElement("a");

    downloadLink.href = url;
    downloadLink.download = `v2-actions-layout-${timestamp}.json`;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(url);
    setLayoutTransferMessage({
      type: "success",
      text: "Layout exported.",
    });
  };

  const triggerLayoutImport = () => {
    layoutFileInputRef.current?.click();
  };

  const importLayoutFromJson = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const rawText = await file.text();
      const parsedJson = JSON.parse(rawText);
      const importedLayouts =
        parsedJson &&
        typeof parsedJson === "object" &&
        "sectionLayouts" in parsedJson
          ? parsedJson.sectionLayouts
          : parsedJson &&
              typeof parsedJson === "object" &&
              "layouts" in parsedJson
            ? parsedJson.layouts
            : parsedJson &&
                typeof parsedJson === "object" &&
                "actionLayouts" in parsedJson
              ? parsedJson.actionLayouts
              : parsedJson;

      setSectionLayouts(normalizeImportedLayouts(importedLayouts));
      setLayoutTransferMessage({
        type: "success",
        text: `Imported layout from ${file.name}.`,
      });
    } catch {
      setLayoutTransferMessage({
        type: "error",
        text: "Import failed. Use a valid layout JSON file.",
      });
    } finally {
      event.target.value = "";
    }
  };

  const spellbookActions = useMemo(
    () =>
      ACTIONS.filter(
        (action) =>
          action.category === "paladin" ||
          (typeof action.iconKey === "string" &&
            action.iconKey.startsWith("spells/")),
      ),
    [],
  );

  const spellbookActionsByTab = useMemo(() => {
    const map = {};

    SPELLBOOK_TABS.forEach((tab) => {
      map[tab.id] = tab.getItems(spellbookActions);
    });

    return map;
  }, [spellbookActions]);

  const activeSpellbookActions = useMemo(
    () =>
      spellbookActionsByTab[activeSpellbookTab] ??
      spellbookActionsByTab.paladin ??
      [],
    [spellbookActionsByTab, activeSpellbookTab],
  );

  const spellbookActionRows = useMemo(() => {
    const classActions = activeSpellbookActions.filter(
      (action) => action.kind === "action",
    );
    const spellActions = activeSpellbookActions.filter(
      (action) => action.kind !== "action",
    );
    const preparedActions = activeSpellbookActions.slice(0, 18);
    const tierRows = SPELLBOOK_TIER_ORDER.map((tierId) => ({
      tierId,
      actions: activeSpellbookActions.filter(
        (action) => action.tier === tierId,
      ),
    })).filter((row) => row.actions.length > 0);

    return {
      classActions,
      spellActions,
      preparedActions,
      tierRows,
    };
  }, [activeSpellbookActions]);

  const activeSpellbookConfig = useMemo(
    () => getTabById(activeSpellbookTab),
    [activeSpellbookTab],
  );

  const spellbookSectionItems = useMemo(() => {
    if (!activeSpellbookConfig) {
      return {};
    }

    const classActions = ACTIONS.filter(
      (action) => action.class === activeSpellbookConfig.id,
    );
    const map = {};

    activeSpellbookConfig.sections.forEach((section) => {
      if (section.source === "prepared") {
        map[section.id] = classActions.filter(
          (action) =>
            action.prepared === true && action.spellbookRow !== "class-action",
        );
        return;
      }

      map[section.id] = classActions.filter(
        (action) => action.spellbookRow === section.rowKey,
      );
    });

    return map;
  }, [activeSpellbookConfig]);

  const getSectionIdForAction = useCallback(
    (action) =>
      SECTION_CONFIG.find((section) => section.categoryId === action.category)
        ?.id ?? null,
    [],
  );

  const handleSpellbookDragStart = (event, action) => {
    const sectionId = getSectionIdForAction(action);

    if (!sectionId) {
      event.preventDefault();
      return;
    }

    setDraggedAction({
      source: "spellbook",
      sectionId,
      itemId: action.id,
    });
    event.dataTransfer.effectAllowed = "copyMove";
    event.dataTransfer.setData("text/plain", action.id);
  };

  const handleSpellbookDragEnd = () => {
    setDraggedAction(null);
    setDropTarget(null);
  };

  const actionsBySection = useMemo(() => {
    const map = {};

    SECTION_CONFIG.forEach((section) => {
      map[section.id] = ACTION_LIBRARY[section.categoryId] ?? [];
    });

    return map;
  }, []);

  const actionBySection = useMemo(() => {
    const map = {};

    SECTION_IDS.forEach((sectionId) => {
      const actions = actionsBySection[sectionId] ?? [];
      map[sectionId] = Object.fromEntries(
        actions.map((item) => [item.id, item]),
      );
    });

    return map;
  }, [actionsBySection]);

  const filteredActionIdsBySection = useMemo(() => {
    const map = {};

    SECTION_IDS.forEach((sectionId) => {
      const actions = actionsBySection[sectionId] ?? [];
      let filteredActions = actions;

      if (activeFilter !== "all") {
        filteredActions = ["action", "bonus", "reaction", "utility"].includes(
          activeFilter,
        )
          ? actions.filter((item) => item.kind === activeFilter)
          : actions.filter((item) => item.tier === activeFilter);
      }

      map[sectionId] = new Set(filteredActions.map((item) => item.id));
    });

    return map;
  }, [actionsBySection, activeFilter]);

  useEffect(() => {
    setDraggedAction(null);
    setDropTarget(null);
  }, [activeFilter]);

  const maximizedSectionId = useMemo(() => {
    const maxIndex = sectionColumns.findIndex(
      (columnCount) => columnCount === TOTAL_SECTION_COLUMNS,
    );

    if (maxIndex === -1) {
      return null;
    }

    const allOtherSectionsCollapsed = sectionColumns.every(
      (columnCount, index) => index === maxIndex || columnCount === 0,
    );

    return allOtherSectionsCollapsed ? SECTION_CONFIG[maxIndex].id : null;
  }, [sectionColumns]);

  const toggleSectionMaximize = (sectionId) => {
    const targetIndex = SECTION_CONFIG.findIndex(
      (section) => section.id === sectionId,
    );

    if (targetIndex === -1) {
      return;
    }

    if (maximizedSectionId === sectionId) {
      resetDividers();
      return;
    }

    setSectionColumns(
      SECTION_CONFIG.map((_, index) =>
        index === targetIndex ? TOTAL_SECTION_COLUMNS : 0,
      ),
    );
  };

  const restoreLongRestResources = () => {
    setResources(buildInitialResources(resourceMax));
  };

  const restoreShortRestResources = () => {
    setResources((current) => ({
      ...current,
      action: resourceMax.action,
      bonus: resourceMax.bonus,
      reaction: resourceMax.reaction,
      channelOath: resourceMax.channelOath,
    }));
  };

  const restoreNewTurnResources = () => {
    setResources((current) => ({
      ...current,
      action: resourceMax.action,
      bonus: resourceMax.bonus,
      reaction: resourceMax.reaction,
    }));
  };

  const resetResourceDefaults = () => {
    setResourceMax(DEFAULT_RESOURCE_MAX);
    setResources(buildInitialResources(DEFAULT_RESOURCE_MAX));
  };

  const adjustResource = (resourceKey, delta, tier) => {
    setResources((current) => {
      const next = { ...current, spellSlots: { ...current.spellSlots } };

      if (tier !== undefined) {
        const tierMax = resourceMax.spellSlots?.[tier] ?? 0;
        next.spellSlots[tier] = clampResourceValue(
          (next.spellSlots[tier] ?? 0) + delta,
          0,
          tierMax,
        );
      } else {
        const keyMax = resourceMax[resourceKey] ?? 0;
        next[resourceKey] = clampResourceValue(
          (next[resourceKey] ?? 0) + delta,
          0,
          keyMax,
        );
      }

      return next;
    });
  };

  const updateResourceMax = (resourceKey, value, tier) => {
    const safeValue = Math.max(0, Math.floor(Number(value) || 0));

    setResourceMax((current) => {
      const next = { ...current, spellSlots: { ...current.spellSlots } };

      if (tier !== undefined) {
        next.spellSlots[tier] = safeValue;
      } else {
        next[resourceKey] = safeValue;
      }

      return next;
    });

    setResources((current) => {
      const next = { ...current, spellSlots: { ...current.spellSlots } };

      if (tier !== undefined) {
        next.spellSlots[tier] = Math.min(
          next.spellSlots[tier] ?? 0,
          safeValue,
        );
      } else {
        next[resourceKey] = Math.min(next[resourceKey] ?? 0, safeValue);
      }

      return next;
    });
  };

  const consumeForAction = (item) => {
    if (!item) {
      return;
    }

    setResources((current) => {
      const next = {
        ...current,
        spellSlots: { ...current.spellSlots },
      };

      if (item.kind === "action") {
        if (next.action <= 0) {
          return current;
        }
        next.action -= 1;
      } else if (item.kind === "bonus") {
        if (next.bonus <= 0) {
          return current;
        }
        next.bonus -= 1;
      } else if (item.kind === "reaction") {
        if (next.reaction <= 0) {
          return current;
        }
        next.reaction -= 1;
      }

      const consumesSpellSlot =
        isSpellAction(item) && item.tier && item.tier !== "C";

      if (consumesSpellSlot) {
        const slotLevel = TIER_TO_SLOT_LEVEL[item.tier];

        if (!slotLevel || (next.spellSlots[slotLevel] ?? 0) <= 0) {
          return current;
        }

        next.spellSlots[slotLevel] -= 1;
      }

      return next;
    });
  };

  const handleActionDrop = (targetSectionId, targetIndex) => {
    if (!draggedAction || draggedAction.sectionId !== targetSectionId) {
      return;
    }

    setSectionLayouts((currentLayouts) => {
      const currentSlots =
        currentLayouts[targetSectionId] ?? Array(SECTION_SLOT_COUNT).fill(null);
      const nextSlots = [...currentSlots];

      if (draggedAction.source === "spellbook") {
        const itemId = draggedAction.itemId;
        const existingIndex = nextSlots.indexOf(itemId);
        const displacedValue = nextSlots[targetIndex] ?? null;

        if (existingIndex === targetIndex) {
          return currentLayouts;
        }

        if (existingIndex !== -1) {
          nextSlots[existingIndex] = displacedValue;
        } else if (displacedValue !== null) {
          const emptySlotIndex = nextSlots.indexOf(null);

          if (emptySlotIndex !== -1) {
            nextSlots[emptySlotIndex] = displacedValue;
          }
        }

        nextSlots[targetIndex] = itemId;
      } else {
        const sourceValue = nextSlots[draggedAction.slotIndex] ?? null;
        const targetValue = nextSlots[targetIndex] ?? null;

        if (sourceValue === null && targetValue === null) {
          return currentLayouts;
        }

        nextSlots[draggedAction.slotIndex] = targetValue;
        nextSlots[targetIndex] = sourceValue;
      }

      return {
        ...currentLayouts,
        [targetSectionId]: nextSlots,
      };
    });
  };

  const renderTilesForSection = (sectionId) => {
    const slots =
      sectionLayouts[sectionId] ?? Array(SECTION_SLOT_COUNT).fill(null);
    const actionById = actionBySection[sectionId] ?? {};
    const visibleActionIds = filteredActionIdsBySection[sectionId] ?? new Set();
    const canDropInSection =
      !draggedAction || draggedAction.sectionId === sectionId;

    return slots.slice(0, SECTION_SLOT_COUNT).map((itemId, index) => {
      const item = itemId ? actionById[itemId] : null;
      const isVisible = item ? visibleActionIds.has(item.id) : false;
      const isDragging =
        draggedAction?.sectionId === sectionId &&
        draggedAction?.slotIndex === index;
      const isDropTarget =
        dropTarget?.sectionId === sectionId && dropTarget?.slotIndex === index;

      if (!item || !isVisible) {
        return (
          <button
            key={`${sectionId}-empty-${index}`}
            type="button"
            className={
              isDropTarget
                ? "v2-action-tile v2-action-tile-empty is-drop-target"
                : "v2-action-tile v2-action-tile-empty"
            }
            aria-hidden="true"
            tabIndex={-1}
            onDragOver={(event) => {
              if (!canDropInSection) {
                return;
              }

              event.preventDefault();
              setDropTarget({ sectionId, slotIndex: index });
            }}
            onDrop={(event) => {
              if (!canDropInSection) {
                return;
              }

              event.preventDefault();
              handleActionDrop(sectionId, index);
              setDropTarget(null);
            }}
          />
        );
      }

      const tileButton = (
        <button
          type="button"
          className={
            isDragging
              ? `v2-action-tile tone-${item.tone} is-dragging`
              : isDropTarget
                ? `v2-action-tile tone-${item.tone} is-drop-target`
                : `v2-action-tile tone-${item.tone}`
          }
          title={`${item.name} (${item.kind})`}
          aria-label={`${item.name} (${item.kind})`}
          draggable
          onClick={() => consumeForAction(item)}
          onDragStart={(event) => {
            setDraggedAction({
              source: "bar",
              sectionId,
              slotIndex: index,
              itemId: item.id,
            });
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", item.id);
          }}
          onDragEnd={() => {
            setDraggedAction(null);
            setDropTarget(null);
          }}
          onDragOver={(event) => {
            if (!canDropInSection) {
              return;
            }

            event.preventDefault();
            setDropTarget({ sectionId, slotIndex: index });
          }}
          onDrop={(event) => {
            if (!canDropInSection) {
              return;
            }

            event.preventDefault();
            handleActionDrop(sectionId, index);
            setDropTarget(null);
          }}
        >
          {item.icon ? (
            <img
              src={item.icon}
              alt=""
              className="v2-action-icon"
              draggable={false}
            />
          ) : (
            <span className="v2-action-short">
              {item.fallbackIconText ?? item.short}
            </span>
          )}
          {item.keybind && (
            <span className="v2-action-keybind">{item.keybind}</span>
          )}
          {item.kind === "bonus" && <span className="v2-action-plus">+</span>}
        </button>
      );

      if (!isSpellAction(item)) {
        return <Fragment key={item.id}>{tileButton}</Fragment>;
      }

      return (
        <SpellHoverPopup key={item.id} spell={item}>
          {tileButton}
        </SpellHoverPopup>
      );
    });
  };

  const renderSpellbookIcons = (actions) => {
    if (!actions.length) {
      return (
        <span className="v2-spellbook-row-empty">No spells in this group.</span>
      );
    }

    return actions.map((action) => {
      const iconButton = (
        <button
          type="button"
          className="v2-spellbook-icon"
          title={`${action.name} (${action.tier})`}
          draggable
          onDragStart={(event) => handleSpellbookDragStart(event, action)}
          onDragEnd={handleSpellbookDragEnd}
        >
          {action.icon ? (
            <img src={action.icon} alt="" draggable={false} />
          ) : (
            <span className="v2-spellbook-icon-text">
              {action.fallbackIconText ?? action.short}
            </span>
          )}
        </button>
      );

      return (
        <SpellHoverPopup
          key={action.id}
          spell={action}
          positionPreference="vertical"
        >
          {iconButton}
        </SpellHoverPopup>
      );
    });
  };

  return (
    <article className="v2-overview-panel v2-actions-panel">
      <header className="v2-overview-panel-header">
        <h2>Actions / Spells</h2>
      </header>

      <div className="v2-actions-menu">
        <V2ResourcePips
          resources={resources}
          max={resourceMax}
          onNewTurn={restoreNewTurnResources}
          onShortRest={restoreShortRestResources}
          onLongRest={restoreLongRestResources}
          onAdjust={adjustResource}
          onUpdateMax={updateResourceMax}
          onResetDefaults={resetResourceDefaults}
        />

        <div className="v2-actions-menu-top">
          <div
            className="v2-actions-filter-strip"
            role="tablist"
            aria-label="Action filters"
          >
            {FILTER_TABS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={activeFilter === filter.id ? "is-active" : ""}
                role="tab"
                aria-selected={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="v2-actions-layout-controls">
            <button
              type="button"
              className={isSpellbookOpen ? "is-active" : ""}
              onClick={() =>
                setIsSpellbookOpen((currentValue) => !currentValue)
              }
            >
              Spellbook
            </button>
            <button type="button" onClick={exportLayoutAsJson}>
              Export Layout
            </button>
            <button type="button" onClick={triggerLayoutImport}>
              Import Layout
            </button>
            <input
              ref={layoutFileInputRef}
              type="file"
              accept="application/json,.json"
              className="v2-actions-layout-file-input"
              onChange={importLayoutFromJson}
            />
            <span
              className={
                layoutTransferMessage?.type === "error"
                  ? "v2-actions-layout-status is-error"
                  : "v2-actions-layout-status"
              }
            >
              {layoutTransferMessage?.text ??
                "Import or export icon layout JSON"}
            </span>
          </div>
        </div>

        <div className="v2-actions-menu-body">
          <div
            ref={gridClusterRef}
            className="v2-actions-grid-cluster"
            style={{
              "--v2-actions-col-1": `${sectionColumns[0]}fr`,
              "--v2-actions-col-2": `${sectionColumns[1]}fr`,
              "--v2-actions-col-3": `${sectionColumns[2]}fr`,
            }}
          >
            {SECTION_CONFIG.map((section, index) => (
              <Fragment key={section.id}>
                <div className="v2-actions-grid-section-wrap">
                  {(() => {
                    const visibleColumns = Math.max(sectionColumns[index], 1);
                    const sectionWidthPercent =
                      (TOTAL_SECTION_COLUMNS / visibleColumns) * 100;

                    return (
                      <div
                        className="v2-actions-grid-section"
                        style={{
                          gridTemplateColumns: `repeat(${TOTAL_SECTION_COLUMNS}, minmax(0, 1fr))`,
                          width: `${sectionWidthPercent}%`,
                        }}
                      >
                        {renderTilesForSection(section.id)}
                      </div>
                    );
                  })()}
                </div>
                {index < SECTION_CONFIG.length - 1 && (
                  <button
                    type="button"
                    className={
                      draggedDivider === index
                        ? "v2-actions-section-divider is-dragging"
                        : "v2-actions-section-divider"
                    }
                    role="separator"
                    aria-orientation="vertical"
                    aria-label={`Resize ${section.id} and ${SECTION_CONFIG[index + 1].id} groups`}
                    onDoubleClick={resetDividers}
                    onPointerDown={(event) => startDividerDrag(index, event)}
                  />
                )}
              </Fragment>
            ))}

            {draggedDivider !== null && dragPreviewRatio !== null && (
              <div
                className="v2-actions-drag-preview"
                aria-hidden="true"
                style={{
                  left: `calc(${dragPreviewRatio * 100}% - (var(--v2-actions-divider-size) / 2))`,
                }}
              />
            )}
          </div>

          <div
            className="v2-actions-metamagic-divider"
            role="separator"
            aria-orientation="vertical"
            aria-hidden="true"
          />

          <aside
            className="v2-actions-metamagic-rail"
            aria-label="Metamagic options"
          >
            {Array.from({ length: METAMAGIC_SLOT_COUNT }).map(
              (_, slotIndex) => {
                const option = METAMAGIC_OPTIONS[slotIndex];

                if (!option) {
                  return (
                    <div
                      key={`metamagic-empty-${slotIndex}`}
                      className="v2-metamagic-tile v2-metamagic-tile-empty"
                      aria-hidden="true"
                    />
                  );
                }

                return (
                  <MetamagicHoverPopup
                    key={option.id}
                    metamagic={option}
                    positionPreference="horizontal"
                  >
                    <button
                      type="button"
                      className="v2-metamagic-tile"
                      title={option.name}
                      aria-label={option.name}
                    >
                      <img
                        src={option.icon}
                        alt=""
                        className="v2-metamagic-icon"
                        draggable={false}
                      />
                    </button>
                  </MetamagicHoverPopup>
                );
              },
            )}
          </aside>
        </div>

        <div
          className="v2-actions-category-tabs"
          role="tablist"
          aria-label="Category focus controls"
        >
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={maximizedSectionId === tab.id ? "is-active" : ""}
              role="tab"
              aria-selected={maximizedSectionId === tab.id}
              onClick={() => toggleSectionMaximize(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isSpellbookOpen && (
        <div className="v2-spellbook-layer" aria-hidden={!isSpellbookOpen}>
          <section
            ref={spellbookPopupRef}
            className={
              spellbookDragState
                ? "v2-spellbook-popup is-moved is-dragging"
                : spellbookPosition
                  ? "v2-spellbook-popup is-moved"
                  : "v2-spellbook-popup"
            }
            role="dialog"
            aria-modal="false"
            aria-label="Spellbook"
            style={
              spellbookPosition
                ? {
                    left: `${spellbookPosition.left}px`,
                    top: `${spellbookPosition.top}px`,
                  }
                : undefined
            }
          >
            <nav
              className="v2-spellbook-tab-strip"
              aria-label="Spellbook tabs"
              onPointerDown={(event) => {
                if (event.target.closest("button")) {
                  return;
                }
                handleSpellbookHeaderPointerDown(event);
              }}
            >
              {SPELLBOOK_TABS.map((tab) => {
                const tabConfig = getTabById(tab.id);
                const preparedLimit = tabConfig?.preparedLimit ?? 0;
                const preparedCount = preparedLimit
                  ? ACTIONS.filter(
                      (action) =>
                        action.class === tab.id &&
                        action.prepared === true &&
                        action.spellbookRow !== "class-action",
                    ).length
                  : 0;
                const fallbackCount =
                  spellbookActionsByTab[tab.id]?.length ?? 0;
                const tabCountLabel = preparedLimit
                  ? `(${preparedCount}/${preparedLimit})`
                  : `(${fallbackCount})`;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={
                      activeSpellbookTab === tab.id
                        ? "v2-spellbook-tab is-active"
                        : "v2-spellbook-tab"
                    }
                    onClick={() => setActiveSpellbookTab(tab.id)}
                  >
                    <span>
                      {tab.label}{" "}
                      <small className="v2-spellbook-tab-count">
                        {tabCountLabel}
                      </small>
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                className="v2-spellbook-close"
                onClick={() => setIsSpellbookOpen(false)}
                aria-label="Close spellbook"
                title="Close (Esc)"
              >
                ×
              </button>
            </nav>

            <div
              className="v2-spellbook-surface"
              onPointerDown={(event) => {
                if (
                  event.target.closest(
                    "button, input, .v2-spellbook-icon, .v2-spellbook-stat-pill, .v2-spellbook-stat-flat, .spell-hover-popup-trigger",
                  )
                ) {
                  return;
                }
                handleSpellbookHeaderPointerDown(event);
              }}
            >
            {activeSpellbookConfig ? (
              <div className="v2-spellbook-body">
                <aside className="v2-spellbook-class-rail">
                  <div className="v2-spellbook-class-crest">
                    <img
                      src={activeSpellbookConfig.crest}
                      alt={activeSpellbookConfig.label}
                      draggable={false}
                    />
                  </div>
                  <div className="v2-spellbook-class-badge">
                    Lv {activeSpellbookConfig.classLevel}
                  </div>
                </aside>

                <div className="v2-spellbook-content">
                  <div className="v2-spellbook-subheader">
                    <div className="v2-spellbook-oath">
                      {activeSpellbookConfig.subclassLabel}
                    </div>
                    <div
                      className="v2-spellbook-stat-strip"
                      aria-label="Spellbook stats"
                    >
                      <span
                        className="v2-spellbook-stat-pill"
                        title={`Spellcasting ability: ${activeSpellbookConfig.abilityLabel}`}
                      >
                        <span className="v2-spellbook-stat-glyph">★</span>
                        <strong>{activeSpellbookConfig.abilityLabel}</strong>
                      </span>
                      <span
                        className="v2-spellbook-stat-pill"
                        title="Spell Attack Modifier"
                      >
                        <img src={SpellSlotIcon} alt="" draggable={false} />
                        <strong>{activeSpellbookConfig.spellAttackMod}</strong>
                      </span>
                      <span
                        className="v2-spellbook-stat-pill"
                        title="Spell Save DC"
                      >
                        <span className="v2-spellbook-stat-glyph">DC</span>
                        <strong>{activeSpellbookConfig.spellSaveDC}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="v2-spellbook-pane">
                    {activeSpellbookConfig.sections.map((section) => {
                      const items = spellbookSectionItems[section.id] ?? [];
                      const isPrepared = section.id === "prepared";
                      const tier = section.slotPipsKey;
                      const slotsMax =
                        tier !== undefined
                          ? resourceMax.spellSlots?.[tier] ?? 0
                          : 0;
                      const slotsRemaining =
                        tier !== undefined
                          ? resources.spellSlots?.[tier] ?? 0
                          : 0;
                      const trailingEmpty =
                        isPrepared && activeSpellbookConfig.preparedLimit
                          ? Math.max(
                              0,
                              activeSpellbookConfig.preparedLimit - items.length,
                            )
                          : 0;

                      return (
                        <SpellbookRow
                          key={section.id}
                          glyphKey={section.glyphKey}
                          label={section.label}
                          showLabel={!!section.showLabel}
                          framed={!!section.framed}
                          trailingEmptySlots={trailingEmpty}
                          slotsRemaining={slotsRemaining}
                          slotsMax={slotsMax}
                        >
                          {renderSpellbookIcons(items)}
                        </SpellbookRow>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="v2-spellbook-body">
                <aside className="v2-spellbook-class-rail" aria-hidden="true">
                  <div className="v2-spellbook-class-badge">Lv 9</div>
                  <div className="v2-spellbook-slot-pips">
                    <span />
                    <span />
                    <span />
                  </div>
                </aside>

                <div className="v2-spellbook-grid">
                  <section className="v2-spellbook-row">
                    <h3>Class Actions</h3>
                    <div className="v2-spellbook-icon-row">
                      {renderSpellbookIcons(spellbookActionRows.classActions)}
                    </div>
                  </section>

                  <section className="v2-spellbook-row">
                    <h3>Spells</h3>
                    <div className="v2-spellbook-icon-row">
                      {renderSpellbookIcons(spellbookActionRows.spellActions)}
                    </div>
                  </section>

                  <section
                    className="v2-spellbook-prepared-row"
                    aria-label="Prepared strip"
                  >
                    <span className="v2-spellbook-prepared-label">Prepared</span>
                    <div className="v2-spellbook-icon-row is-prepared">
                      {renderSpellbookIcons(spellbookActionRows.preparedActions)}
                    </div>
                  </section>

                  {spellbookActionRows.tierRows.map((row) => (
                    <section key={row.tierId} className="v2-spellbook-tier-row">
                      <span className="v2-spellbook-tier-label">
                        {row.tierId}
                      </span>
                      <div className="v2-spellbook-icon-row">
                        {renderSpellbookIcons(row.actions)}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}
            </div>
          </section>
        </div>
      )}
    </article>
  );
};

export default V2ActionsPanel;
