import {
  Fragment,
  Suspense,
  lazy,
  useCallback,
  useMemo,
  useState,
} from "react";
import { pickRollKind, toAvraeCommand } from "../../../data/avrae";
import { CONDITIONS, sumExtraActions } from "../../../data/conditionsCatalog";
import { useConditions } from "../../../state/ConditionsContext";
import { useCharacterStats } from "../../../state/CharacterStatsContext";
import V2ResourcePips from "./V2ResourcePips";
import {
  DEFAULT_RESOURCE_MAX,
  buildInitialResources,
} from "./actions/resources";
import {
  PREPARED_TAB_LABELS_BY_CLASS,
  isActionLockedForPreparation,
  sanitizePreparedLimitsByClass,
  sanitizePreparedSpellIds,
} from "./actions/preparedSpells";
import {
  CATEGORY_TABS,
  DEFAULT_SECTION_COLUMNS,
  FILTER_TABS,
  SECTION_CONFIG,
  SECTION_SLOT_COUNT,
  TOTAL_SECTION_COLUMNS,
  createInitialSectionLayouts,
  normalizeImportedLayouts,
} from "./actions/sectionLayout";
import MetamagicTray from "./actions/MetamagicTray";
import RollToast from "./actions/RollToast";
import OptionTabStrip from "./actions/OptionTabStrip";
import ActionsLayoutControls from "./actions/ActionsLayoutControls";
// SpellbookOverlay only mounts when the user opens the spellbook
// (and never on the Overview boot path). Code-split it so its
// metamagic icon imports + SpellbookRow popup tree don't sit on
// the initial chunk.
const SpellbookOverlay = lazy(() => import("./actions/SpellbookOverlay"));
import { ActionTile, EmptyActionTile } from "./actions/ActionTile";
import { useDividerDrag } from "./actions/useDividerDrag";
import { useSpellbookOverlayPosition } from "./actions/useSpellbookOverlayPosition";
import { useActionResources } from "./actions/useActionResources";
import { useSpellbookIconRenderers } from "./actions/useSpellbookIconRenderers";
import { useSpellbookData } from "./actions/useSpellbookData";
import { useActionDragDrop } from "./actions/useActionDragDrop";
import { useLayoutTransfer } from "./actions/useLayoutTransfer";
import { usePreparedSpellsState } from "./actions/usePreparedSpellsState";
import { useActionsPersistence } from "./actions/useActionsPersistence";
import { useRollToast } from "./actions/useRollToast";
import { useActionsCatalog } from "./actions/useActionsCatalog";
import { useEscapeKey } from "./actions/useEscapeKey";

const PERSISTED_CHARACTER_ID = "default";

const V2ActionsPanel = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const {
    gridClusterRef,
    sectionColumns,
    setSectionColumns,
    draggedDivider,
    dragPreviewRatio,
    startDividerDrag,
    resetDividers,
  } = useDividerDrag();
  const [sectionLayouts, setSectionLayouts] = useState(
    createInitialSectionLayouts,
  );
  const {
    draggedAction,
    dropTarget,
    handleSpellbookDragStart,
    handleSpellbookDragEnd,
    handleTileDragStart,
    handleTileDragEnd,
    handleTileDragOver,
    handleTileDrop,
  } = useActionDragDrop({ setSectionLayouts, activeFilter });
  const [isSpellbookOpen, setIsSpellbookOpen] = useState(false);
  const [activeSpellbookTab, setActiveSpellbookTab] = useState("paladin");
  const {
    spellbookPopupRef,
    spellbookPosition,
    spellbookDragState,
    handleHeaderPointerDown: handleSpellbookHeaderPointerDown,
  } = useSpellbookOverlayPosition({ isOpen: isSpellbookOpen });
  const {
    transferMessage: layoutTransferMessage,
    fileInputRef: layoutFileInputRef,
    exportLayoutAsJson,
    triggerLayoutImport,
    importLayoutFromJson,
  } = useLayoutTransfer({ sectionLayouts, setSectionLayouts });
  const {
    preparedSpellIds,
    setPreparedSpellIds,
    preparedLimitsByClass,
    setPreparedLimitsByClass,
    togglePreparedSpell,
    updatePreparedLimit,
    resetPreparedLimits,
  } = usePreparedSpellsState();
  const { rollToast, setRollToast } = useRollToast();
  const [isGwmActive, setIsGwmActive] = useState(false);
  const { activeConditions, applyCondition, tickConditions } = useConditions();
  const { tokenValues } = useCharacterStats();
  const extraActions = sumExtraActions(activeConditions);
  const {
    resources,
    setResources,
    resourceMax,
    setResourceMax,
    effectiveResourceMax,
    restoreLongRestResources,
    restoreShortRestResources,
    restoreNewTurnResources,
    resetResourceDefaults: resetResourcesOnly,
    adjustResource,
    updateResourceMax,
    consumeForAction,
  } = useActionResources({
    extraActions,
    onTickConditions: tickConditions,
  });

  const handleHydrate = useCallback((saved) => {
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
    // setters from hooks are stable; safe to omit from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useActionsPersistence({
    characterId: PERSISTED_CHARACTER_ID,
    state: {
      resources,
      resourceMax,
      sectionLayouts,
      sectionColumns,
      preparedSpellIds,
      preparedLimitsByClass,
    },
    onHydrate: handleHydrate,
  });

  const closeSpellbook = useCallback(() => setIsSpellbookOpen(false), []);
  useEscapeKey(isSpellbookOpen, closeSpellbook);

  const {
    spellbookActionsByTab,
    spellbookActionRows,
    activeSpellbookConfig,
    spellbookSectionItems,
  } = useSpellbookData({ activeSpellbookTab, preparedSpellIds });

  const { actionBySection, filteredActionIdsBySection } =
    useActionsCatalog(activeFilter);

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

  const resetResourceDefaults = () => {
    resetResourcesOnly();
    resetPreparedLimits();
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
          <EmptyActionTile
            key={`${sectionId}-empty-${index}`}
            sectionId={sectionId}
            index={index}
            isDropTarget={isDropTarget}
            canDropInSection={canDropInSection}
            onDragOver={handleTileDragOver}
            onDrop={handleTileDrop}
          />
        );
      }

      return (
        <ActionTile
          key={item.id}
          item={item}
          sectionId={sectionId}
          index={index}
          isDragging={isDragging}
          isDropTarget={isDropTarget}
          isGwmActive={isGwmActive}
          preparedSpellIds={preparedSpellIds}
          resources={resources}
          canDropInSection={canDropInSection}
          onActionClick={handleActionClick}
          onDragStart={handleTileDragStart}
          onDragEnd={handleTileDragEnd}
          onDragOver={handleTileDragOver}
          onDrop={handleTileDrop}
        />
      );
    });
  };

  const { renderSpellbookIcons, renderMetamagicSpellbookIcons } =
    useSpellbookIconRenderers({
      onDragStart: handleSpellbookDragStart,
      onDragEnd: handleSpellbookDragEnd,
    });

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

          <ActionsLayoutControls
            ref={layoutFileInputRef}
            isSpellbookOpen={isSpellbookOpen}
            onToggleSpellbook={() =>
              setIsSpellbookOpen((currentValue) => !currentValue)
            }
            onExportLayout={exportLayoutAsJson}
            onImportLayout={triggerLayoutImport}
            onImportFile={importLayoutFromJson}
            transferMessage={layoutTransferMessage}
          />
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
        <Suspense fallback={null}>
          <SpellbookOverlay
            ref={spellbookPopupRef}
            isOpen={isSpellbookOpen}
            spellbookDragState={spellbookDragState}
            spellbookPosition={spellbookPosition}
            activeSpellbookTab={activeSpellbookTab}
            activeSpellbookConfig={activeSpellbookConfig}
            preparedLimitsByClass={preparedLimitsByClass}
            preparedSpellIds={preparedSpellIds}
            spellbookActionsByTab={spellbookActionsByTab}
            spellbookSectionItems={spellbookSectionItems}
            spellbookActionRows={spellbookActionRows}
            resources={resources}
            resourceMax={resourceMax}
            onSelectTab={setActiveSpellbookTab}
            onClose={() => setIsSpellbookOpen(false)}
            onHeaderPointerDown={handleSpellbookHeaderPointerDown}
            togglePreparedSpell={togglePreparedSpell}
            renderSpellbookIcons={renderSpellbookIcons}
            renderMetamagicSpellbookIcons={renderMetamagicSpellbookIcons}
          />
        </Suspense>
      )}

      <RollToast toast={rollToast} />
    </article>
  );
};

export default V2ActionsPanel;
