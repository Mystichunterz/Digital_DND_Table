import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ACTION_LIBRARY } from "../../../data/actionsCatalog";

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "action", label: "Act" },
  { id: "bonus", label: "Bon" },
  { id: "reaction", label: "Rct" },
  { id: "utility", label: "Utl" },
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

const QUICK_ITEMS = [
  { id: "bomb", short: "BM", count: 13, tone: "red" },
  { id: "oil", short: "OL", count: 10, tone: "red" },
  { id: "healing-potion", short: "HP", count: 3, tone: "green" },
  { id: "superior-potion", short: "SP", count: 3, tone: "red" },
  { id: "scroll", short: "SC", count: 10, tone: "blue" },
  { id: "poison", short: "PS", count: 9, tone: "green" },
  { id: "stone", short: "ST", count: 2, tone: "neutral" },
  { id: "bag", short: "BG", count: 3, tone: "neutral" },
];

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
  const [layoutTransferMessage, setLayoutTransferMessage] = useState(null);
  const gridClusterRef = useRef(null);
  const layoutFileInputRef = useRef(null);

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

  const handleActionDrop = (targetSectionId, targetIndex) => {
    if (!draggedAction || draggedAction.sectionId !== targetSectionId) {
      return;
    }

    setSectionLayouts((currentLayouts) => {
      const currentSlots =
        currentLayouts[targetSectionId] ?? Array(SECTION_SLOT_COUNT).fill(null);
      const nextSlots = [...currentSlots];
      const sourceValue = nextSlots[draggedAction.slotIndex] ?? null;
      const targetValue = nextSlots[targetIndex] ?? null;

      if (sourceValue === null && targetValue === null) {
        return currentLayouts;
      }

      nextSlots[draggedAction.slotIndex] = targetValue;
      nextSlots[targetIndex] = sourceValue;

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

      return (
        <button
          key={item.id}
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
          onDragStart={(event) => {
            setDraggedAction({ sectionId, slotIndex: index, itemId: item.id });
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
            <span className="v2-action-short">{item.short}</span>
          )}
          {item.keybind && (
            <span className="v2-action-keybind">{item.keybind}</span>
          )}
          {item.kind === "bonus" && <span className="v2-action-plus">+</span>}
        </button>
      );
    });
  };

  return (
    <article className="v2-overview-panel v2-actions-panel">
      <header className="v2-overview-panel-header">
        <h2>Actions / Spells</h2>
      </header>

      <div className="v2-actions-menu">
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

          <aside className="v2-actions-item-rail" aria-label="Quick item slots">
            {QUICK_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`v2-item-slot tone-${item.tone}`}
              >
                <span className="v2-item-short">{item.short}</span>
                <span className="v2-item-count">{item.count}</span>
              </button>
            ))}
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
    </article>
  );
};

export default V2ActionsPanel;
