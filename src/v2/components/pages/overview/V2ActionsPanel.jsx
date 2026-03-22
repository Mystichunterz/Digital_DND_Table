import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ACTION_LIBRARY } from "../../../data/actionsCatalog";

const CATEGORY_TABS = [
  { id: "common", label: "Common" },
  { id: "paladin", label: "Paladin" },
  { id: "items", label: "Items" },
  { id: "passives", label: "Passives" },
  { id: "custom", label: "Custom" },
];

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
  { id: "mobility", defaultColumns: 4 },
  { id: "offense", defaultColumns: 5 },
  { id: "support", defaultColumns: 4 },
];

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

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const buildInitialCategoryLayout = (actions) => {
  const layout = {};

  SECTION_CONFIG.forEach((section) => {
    const sectionActions = actions.filter(
      (item) => item.section === section.id,
    );
    const slots = Array(SECTION_SLOT_COUNT).fill(null);

    sectionActions.forEach((item, index) => {
      if (index < SECTION_SLOT_COUNT) {
        slots[index] = item.id;
      }
    });

    layout[section.id] = slots;
  });

  return layout;
};

const createInitialActionLayouts = () => {
  const layouts = {};

  Object.entries(ACTION_LIBRARY).forEach(([categoryId, actions]) => {
    layouts[categoryId] = buildInitialCategoryLayout(actions);
  });

  return layouts;
};

const normalizeImportedCategoryLayout = (
  categoryId,
  importedCategoryLayout,
) => {
  const categoryActions = ACTION_LIBRARY[categoryId] ?? [];
  const actionById = Object.fromEntries(
    categoryActions.map((action) => [action.id, action]),
  );
  const normalizedCategoryLayout = {};

  SECTION_IDS.forEach((sectionId) => {
    const importedSlots = Array.isArray(importedCategoryLayout?.[sectionId])
      ? importedCategoryLayout[sectionId]
      : [];
    const sanitizedSlots = Array(SECTION_SLOT_COUNT).fill(null);

    for (let index = 0; index < SECTION_SLOT_COUNT; index += 1) {
      const maybeActionId = importedSlots[index];

      if (typeof maybeActionId === "string" && actionById[maybeActionId]) {
        sanitizedSlots[index] = maybeActionId;
      }
    }

    normalizedCategoryLayout[sectionId] = sanitizedSlots;
  });

  const seenActionIds = new Set();

  SECTION_IDS.forEach((sectionId) => {
    normalizedCategoryLayout[sectionId] = normalizedCategoryLayout[
      sectionId
    ].map((actionId) => {
      if (!actionId || seenActionIds.has(actionId)) {
        return null;
      }

      seenActionIds.add(actionId);
      return actionId;
    });
  });

  const missingActionIds = categoryActions
    .map((action) => action.id)
    .filter((actionId) => !seenActionIds.has(actionId));

  missingActionIds.forEach((actionId) => {
    const preferredSection = actionById[actionId].section;
    const sectionPriority = [
      preferredSection,
      ...SECTION_IDS.filter((sectionId) => sectionId !== preferredSection),
    ];

    for (let index = 0; index < sectionPriority.length; index += 1) {
      const sectionId = sectionPriority[index];
      const slotIndex = normalizedCategoryLayout[sectionId].indexOf(null);

      if (slotIndex !== -1) {
        normalizedCategoryLayout[sectionId][slotIndex] = actionId;
        seenActionIds.add(actionId);
        break;
      }
    }
  });

  return normalizedCategoryLayout;
};

const normalizeImportedLayouts = (importedLayouts) => {
  const baseLayouts = createInitialActionLayouts();

  if (!importedLayouts || typeof importedLayouts !== "object") {
    return baseLayouts;
  }

  Object.keys(ACTION_LIBRARY).forEach((categoryId) => {
    baseLayouts[categoryId] = normalizeImportedCategoryLayout(
      categoryId,
      importedLayouts[categoryId],
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
  const [activeCategory, setActiveCategory] = useState("common");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sectionColumns, setSectionColumns] = useState(DEFAULT_SECTION_COLUMNS);
  const [draggedDivider, setDraggedDivider] = useState(null);
  const [dragPreviewRatio, setDragPreviewRatio] = useState(null);
  const [actionLayouts, setActionLayouts] = useState(
    createInitialActionLayouts,
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
      version: 1,
      exportedAt: now.toISOString(),
      layouts: actionLayouts,
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
        parsedJson && typeof parsedJson === "object" && "layouts" in parsedJson
          ? parsedJson.layouts
          : parsedJson &&
              typeof parsedJson === "object" &&
              "actionLayouts" in parsedJson
            ? parsedJson.actionLayouts
            : parsedJson;

      setActionLayouts(normalizeImportedLayouts(importedLayouts));
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

  const actions = useMemo(
    () => ACTION_LIBRARY[activeCategory] ?? [],
    [activeCategory],
  );

  const actionById = useMemo(
    () => Object.fromEntries(actions.map((item) => [item.id, item])),
    [actions],
  );

  const filteredActions = useMemo(() => {
    if (activeFilter === "all") {
      return actions;
    }

    if (["action", "bonus", "reaction", "utility"].includes(activeFilter)) {
      return actions.filter((item) => item.kind === activeFilter);
    }

    return actions.filter((item) => item.tier === activeFilter);
  }, [actions, activeFilter]);

  const filteredActionIds = useMemo(
    () => new Set(filteredActions.map((item) => item.id)),
    [filteredActions],
  );

  useEffect(() => {
    setDraggedAction(null);
    setDropTarget(null);
  }, [activeCategory, activeFilter]);

  const activeLayout =
    actionLayouts[activeCategory] ?? buildInitialCategoryLayout(actions);

  const handleActionDrop = (targetSectionId, targetIndex) => {
    if (!draggedAction) {
      return;
    }

    setActionLayouts((currentLayouts) => {
      const categoryLayout = currentLayouts[activeCategory];

      if (!categoryLayout) {
        return currentLayouts;
      }

      const nextCategoryLayout = {
        mobility: [...(categoryLayout.mobility ?? [])],
        offense: [...(categoryLayout.offense ?? [])],
        support: [...(categoryLayout.support ?? [])],
      };

      const sourceSlots = nextCategoryLayout[draggedAction.sectionId];
      const targetSlots = nextCategoryLayout[targetSectionId];

      if (!sourceSlots || !targetSlots) {
        return currentLayouts;
      }

      const sourceValue = sourceSlots[draggedAction.slotIndex] ?? null;
      const targetValue = targetSlots[targetIndex] ?? null;

      if (sourceValue === null && targetValue === null) {
        return currentLayouts;
      }

      sourceSlots[draggedAction.slotIndex] = targetValue;
      targetSlots[targetIndex] = sourceValue;

      return {
        ...currentLayouts,
        [activeCategory]: nextCategoryLayout,
      };
    });
  };

  const renderTilesForSection = (sectionId) => {
    const slots =
      activeLayout[sectionId] ?? Array(SECTION_SLOT_COUNT).fill(null);

    return slots.slice(0, SECTION_SLOT_COUNT).map((itemId, index) => {
      const item = itemId ? actionById[itemId] : null;
      const isVisible = item ? filteredActionIds.has(item.id) : false;
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
              event.preventDefault();
              setDropTarget({ sectionId, slotIndex: index });
            }}
            onDrop={(event) => {
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
            event.preventDefault();
            setDropTarget({ sectionId, slotIndex: index });
          }}
          onDrop={(event) => {
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
          aria-label="Action categories"
        >
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeCategory === tab.id ? "is-active" : ""}
              role="tab"
              aria-selected={activeCategory === tab.id}
              onClick={() => setActiveCategory(tab.id)}
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
