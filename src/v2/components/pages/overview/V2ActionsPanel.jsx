import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ACTIONS, ACTION_LIBRARY } from "../../../data/actionsCatalog";
import { pickRollKind, toAvraeCommand } from "../../../data/avrae";
import { CONDITIONS, sumExtraActions } from "../../../data/conditionsCatalog";
import { useConditions } from "../../../state/ConditionsContext";
import { useCharacterStats } from "../../../state/CharacterStatsContext";
import { usePersistedDebounce } from "../../../state/usePersistedDebounce";
import { useTrackHydration } from "../../../state/PersistenceStatusContext";
import { getTabById } from "../../../data/spellbookTabs";
import SpellHoverPopup from "../../popups/SpellHoverPopup";
import MetamagicHoverPopup from "../../popups/MetamagicHoverPopup";
import SpellbookRow from "../../popups/SpellbookRow";
import V2ResourcePips from "./V2ResourcePips";
import {
  DEFAULT_RESOURCE_MAX,
  TIER_TO_SLOT_LEVEL,
  buildInitialResources,
  canAffordAction,
  clampResourceValue,
  isSpellAction,
} from "./actions/resources";
import {
  DEFAULT_PREPARED_LIMITS_BY_CLASS,
  DEFAULT_PREPARED_SPELL_IDS,
  PREPARED_TAB_LABELS_BY_CLASS,
  PREPARED_TOGGLE_ROW_KEYS,
  isActionLockedForPreparation,
  sanitizePreparedLimitsByClass,
  sanitizePreparedSpellIds,
} from "./actions/preparedSpells";
import {
  CATEGORY_TABS,
  DEFAULT_SECTION_COLUMNS,
  FILTER_TABS,
  SECTION_CONFIG,
  SECTION_IDS,
  SECTION_SLOT_COUNT,
  TOTAL_SECTION_COLUMNS,
  clamp,
  createInitialSectionLayouts,
  normalizeImportedLayouts,
} from "./actions/sectionLayout";
import { METAMAGIC_OPTIONS } from "./actions/metamagicOptions";
import MetamagicTray from "./actions/MetamagicTray";
import RollToast from "./actions/RollToast";
import OptionTabStrip from "./actions/OptionTabStrip";
import {
  SPELLBOOK_TABS,
  SPELLBOOK_TIER_ORDER,
  SPELLBOOK_VIEWPORT_MARGIN,
} from "./actions/spellbookConfig";
import SpellSlotIcon from "../../../../assets/resources/spell_slot.png";

const PERSISTED_CHARACTER_ID = "default";

const LockOverlayIcon = ({ className = "v2-action-lock-overlay" }) => (
  <span className={className} aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.25a4.75 4.75 0 0 0-4.75 4.75V10H6.5A2.25 2.25 0 0 0 4.25 12.25v7.5A2.25 2.25 0 0 0 6.5 22h11a2.25 2.25 0 0 0 2.25-2.25v-7.5A2.25 2.25 0 0 0 17.5 10h-.75V7A4.75 4.75 0 0 0 12 2.25Zm-3.25 4.75a3.25 3.25 0 1 1 6.5 0V10h-6.5V7Z" />
    </svg>
  </span>
);

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
  const [preparedSpellIds, setPreparedSpellIds] = useState(
    DEFAULT_PREPARED_SPELL_IDS,
  );
  const [preparedLimitsByClass, setPreparedLimitsByClass] = useState(
    DEFAULT_PREPARED_LIMITS_BY_CLASS,
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [rollToast, setRollToast] = useState(null);
  const [isGwmActive, setIsGwmActive] = useState(false);
  const { activeConditions, applyCondition, tickConditions } = useConditions();
  const { tokenValues } = useCharacterStats();
  const extraActions = sumExtraActions(activeConditions);
  const effectiveResourceMax = useMemo(
    () => ({
      ...resourceMax,
      action: resourceMax.action + extraActions,
    }),
    [resourceMax, extraActions],
  );
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
            const effectivePreparedLimits = sanitizePreparedLimitsByClass(
              saved.preparedLimitsByClass,
            );
            setPreparedLimitsByClass(effectivePreparedLimits);
            if (saved.preparedSpellIds) {
              setPreparedSpellIds(
                sanitizePreparedSpellIds(
                  saved.preparedSpellIds,
                  effectivePreparedLimits,
                ),
              );
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

  useTrackHydration(isHydrated);

  usePersistedDebounce({
    enabled: isHydrated,
    url: `/api/state/${PERSISTED_CHARACTER_ID}`,
    body: {
      resources,
      resourceMax,
      sectionLayouts,
      sectionColumns,
      preparedSpellIds,
      preparedLimitsByClass,
    },
  });

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
    if (!rollToast) {
      return undefined;
    }

    const timeoutId = setTimeout(() => setRollToast(null), 1800);

    return () => clearTimeout(timeoutId);
  }, [rollToast]);

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
        const preparedIds =
          preparedSpellIds[activeSpellbookConfig.id] ?? [];
        const actionsById = new Map(
          classActions
            .filter((action) => action.spellbookRow !== "class-action")
            .map((action) => [action.id, action]),
        );
        map[section.id] = preparedIds
          .map((actionId) => actionsById.get(actionId))
          .filter(Boolean);
        return;
      }

      if (section.source === "metamagic") {
        map[section.id] = [];
        return;
      }

      const allowedRowKeys = Array.isArray(section.rowKeys)
        ? section.rowKeys
        : section.rowKey
          ? [section.rowKey]
          : [];

      map[section.id] = classActions.filter((action) =>
        allowedRowKeys.includes(action.spellbookRow),
      );
    });

    return map;
  }, [activeSpellbookConfig, preparedSpellIds]);

  const togglePreparedSpell = useCallback(
    (classId, actionId) => {
      const cap =
        preparedLimitsByClass[classId] ??
        DEFAULT_PREPARED_LIMITS_BY_CLASS[classId];

      setPreparedSpellIds((current) => {
        const currentList = current[classId] ?? [];

        if (currentList.includes(actionId)) {
          return {
            ...current,
            [classId]: currentList.filter((id) => id !== actionId),
          };
        }

        if (typeof cap === "number" && currentList.length >= cap) {
          return current;
        }

        return {
          ...current,
          [classId]: [...currentList, actionId],
        };
      });
    },
    [preparedLimitsByClass],
  );

  const updatePreparedLimit = useCallback((classId, value) => {
    const safeValue = Math.max(0, Math.floor(Number(value) || 0));

    setPreparedLimitsByClass((current) => ({
      ...current,
      [classId]: safeValue,
    }));
  }, []);

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
      favouredByGods: resourceMax.favouredByGods,
    }));
  };

  const restoreNewTurnResources = () => {
    tickConditions();
    setResources((current) => ({
      ...current,
      action: effectiveResourceMax.action,
      bonus: resourceMax.bonus,
      reaction: resourceMax.reaction,
    }));
  };

  const resetResourceDefaults = () => {
    setResourceMax(DEFAULT_RESOURCE_MAX);
    setResources(buildInitialResources(DEFAULT_RESOURCE_MAX));
    setPreparedLimitsByClass(DEFAULT_PREPARED_LIMITS_BY_CLASS);
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

  const handleActionClick = (item, event) => {
    if (!item) {
      return;
    }

    if (item.toggle === "gwm") {
      setIsGwmActive((current) => !current);
      return;
    }

    if (isActionLockedForPreparation(item, preparedSpellIds)) {
      return;
    }

    const kind = pickRollKind(item, event);
    const command = toAvraeCommand(item, kind, { gwm: isGwmActive }, tokenValues);

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(command).catch(() => {});
    }

    setRollToast({ command, kind, gwm: isGwmActive, id: Date.now() });
    consumeForAction(item);

    if (item.applies?.condition) {
      applyCondition(item.applies.condition, item.applies.durationTurns);

      const grantedExtraActions =
        CONDITIONS[item.applies.condition]?.effects?.extraActions ?? 0;

      if (grantedExtraActions > 0) {
        setResources((current) => ({
          ...current,
          action: current.action + grantedExtraActions,
        }));
      }
    }
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

      const isLocked = isActionLockedForPreparation(item, preparedSpellIds);
      const isToggleActive = item.toggle === "gwm" && isGwmActive;
      const isUnaffordable = !isLocked && !canAffordAction(item, resources);
      const tileClassName = [
        "v2-action-tile",
        `tone-${item.tone}`,
        isDragging ? "is-dragging" : "",
        isDropTarget ? "is-drop-target" : "",
        isLocked ? "is-locked" : "",
        isUnaffordable ? "is-unaffordable" : "",
        isToggleActive ? "is-toggle-active" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const toggleSuffix = isToggleActive ? " — ON" : "";
      const tileTitle = isLocked
        ? `${item.name} (${item.kind}) — not prepared`
        : isUnaffordable
          ? `${item.name} (${item.kind}) — not enough resources`
          : `${item.name} (${item.kind})${toggleSuffix}`;
      const tileAriaLabel = tileTitle;

      const tileButton = (
        <button
          type="button"
          className={tileClassName}
          title={tileTitle}
          aria-label={tileAriaLabel}
          aria-disabled={isLocked || undefined}
          draggable
          onClick={(event) => handleActionClick(item, event)}
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
          {typeof item.quantity === "number" && (
            <span className="v2-action-qty">{item.quantity}</span>
          )}
          {isLocked && <LockOverlayIcon className="v2-action-lock-overlay" />}
        </button>
      );

      const hasHoverPopup =
        isSpellAction(item) ||
        item.category === "common" ||
        item.category === "items";

      if (!hasHoverPopup) {
        return <Fragment key={item.id}>{tileButton}</Fragment>;
      }

      return (
        <SpellHoverPopup key={item.id} spell={item}>
          {tileButton}
        </SpellHoverPopup>
      );
    });
  };

  const renderSpellbookIcons = (actions, options = {}) => {
    const { onSpellClick, preparedSet, isCapReached } = options;

    if (!actions.length) {
      return (
        <span className="v2-spellbook-row-empty">No spells in this group.</span>
      );
    }

    return actions.map((action) => {
      const isPrepared = preparedSet?.has(action.id) ?? false;
      const isClickable = typeof onSpellClick === "function";
      const isAddDisabled = isClickable && !isPrepared && isCapReached;
      const className = [
        "v2-spellbook-icon",
        isClickable ? "is-clickable" : "",
        isPrepared ? "is-prepared" : "",
        isAddDisabled ? "is-cap-reached" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const titleSuffix = isClickable
        ? isPrepared
          ? " — click to unprepare"
          : isAddDisabled
            ? " — prepared limit reached"
            : " — click to prepare"
        : "";

      const iconButton = (
        <button
          type="button"
          className={className}
          title={`${action.name} (${action.tier})${titleSuffix}`}
          draggable
          onDragStart={(event) => handleSpellbookDragStart(event, action)}
          onDragEnd={handleSpellbookDragEnd}
          onClick={
            isClickable
              ? () => {
                  if (isAddDisabled) {
                    return;
                  }
                  onSpellClick(action);
                }
              : undefined
          }
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

  const renderMetamagicSpellbookIcons = (options) => {
    if (!options.length) {
      return (
        <span className="v2-spellbook-row-empty">
          No metamagic available.
        </span>
      );
    }

    return options.map((option) => (
      <MetamagicHoverPopup
        key={option.id}
        metamagic={option}
        positionPreference="vertical"
      >
        <button
          type="button"
          className="v2-spellbook-icon v2-spellbook-icon-metamagic"
          title={option.name}
          aria-label={option.name}
        >
          <img src={option.icon} alt="" draggable={false} />
        </button>
      </MetamagicHoverPopup>
    ));
  };

  return (
    <article className="v2-overview-panel v2-actions-panel">
      <header className="v2-overview-panel-header">
        <h2>Actions / Spells</h2>
      </header>

      <div className="v2-actions-menu">
        <V2ResourcePips
          resources={resources}
          max={effectiveResourceMax}
          onNewTurn={restoreNewTurnResources}
          onShortRest={restoreShortRestResources}
          onLongRest={restoreLongRestResources}
          onAdjust={adjustResource}
          onUpdateMax={updateResourceMax}
          onResetDefaults={resetResourceDefaults}
          preparedLimitsByClass={preparedLimitsByClass}
          preparedClassLabels={PREPARED_TAB_LABELS_BY_CLASS}
          onUpdatePreparedLimit={updatePreparedLimit}
        />

        <div className="v2-actions-menu-top">
          <OptionTabStrip
            className="v2-actions-filter-strip"
            ariaLabel="Action filters"
            tabs={FILTER_TABS}
            activeId={activeFilter}
            onSelect={setActiveFilter}
          />

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

          <MetamagicTray />
        </div>

        <OptionTabStrip
          className="v2-actions-category-tabs"
          ariaLabel="Category focus controls"
          tabs={CATEGORY_TABS}
          activeId={maximizedSectionId}
          onSelect={toggleSectionMaximize}
        />
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
                const preparedLimit =
                  preparedLimitsByClass[tab.id] ??
                  tabConfig?.preparedLimit ??
                  0;
                const preparedCount = preparedLimit
                  ? preparedSpellIds[tab.id]?.length ?? 0
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
                      const isPrepared = section.id === "prepared";
                      const isMetamagic = section.source === "metamagic";
                      const items = isMetamagic
                        ? METAMAGIC_OPTIONS
                        : spellbookSectionItems[section.id] ?? [];
                      const tier = section.slotPipsKey;
                      const slotsMax =
                        tier !== undefined
                          ? resourceMax.spellSlots?.[tier] ?? 0
                          : 0;
                      const slotsRemaining =
                        tier !== undefined
                          ? resources.spellSlots?.[tier] ?? 0
                          : 0;
                      const effectivePreparedLimit =
                        preparedLimitsByClass[activeSpellbookConfig.id] ??
                        activeSpellbookConfig.preparedLimit;
                      const trailingEmpty =
                        isPrepared && effectivePreparedLimit
                          ? Math.max(
                              0,
                              effectivePreparedLimit - items.length,
                            )
                          : 0;

                      const preparedSet = new Set(
                        preparedSpellIds[activeSpellbookConfig.id] ?? [],
                      );
                      const isToggleRow =
                        isPrepared ||
                        PREPARED_TOGGLE_ROW_KEYS.has(section.rowKey);
                      const isCapReached =
                        typeof effectivePreparedLimit === "number" &&
                        preparedSet.size >= effectivePreparedLimit;
                      const onSpellClick = isToggleRow
                        ? (action) =>
                            togglePreparedSpell(
                              activeSpellbookConfig.id,
                              action.id,
                            )
                        : undefined;

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
                          {isMetamagic
                            ? renderMetamagicSpellbookIcons(items)
                            : renderSpellbookIcons(items, {
                                onSpellClick,
                                preparedSet,
                                isCapReached,
                              })}
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

      <RollToast toast={rollToast} />
    </article>
  );
};

export default V2ActionsPanel;
