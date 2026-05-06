import { forwardRef } from "react";
import SpellbookRow from "../../../popups/SpellbookRow";
import { getTabById } from "../../../../data/spellbookTabs";
import { SPELLBOOK_TABS } from "./spellbookConfig";
import { METAMAGIC_OPTIONS } from "./metamagicOptions";
import { PREPARED_TOGGLE_ROW_KEYS } from "./preparedSpells";
import SpellSlotIcon from "../../../../../assets/resources/spell_slot.png";

const SpellbookTabStrip = ({
  activeSpellbookTab,
  preparedLimitsByClass,
  preparedSpellIds,
  spellbookActionsByTab,
  onSelectTab,
  onClose,
  onPointerDown,
}) => (
  <nav
    className="v2-spellbook-tab-strip"
    aria-label="Spellbook tabs"
    onPointerDown={(event) => {
      if (event.target.closest("button")) {
        return;
      }
      onPointerDown(event);
    }}
  >
    {SPELLBOOK_TABS.map((tab) => {
      const tabConfig = getTabById(tab.id);
      const preparedLimit =
        preparedLimitsByClass[tab.id] ?? tabConfig?.preparedLimit ?? 0;
      const preparedCount = preparedLimit
        ? preparedSpellIds[tab.id]?.length ?? 0
        : 0;
      const fallbackCount = spellbookActionsByTab[tab.id]?.length ?? 0;
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
          onClick={() => onSelectTab(tab.id)}
        >
          <span>
            {tab.label}{" "}
            <small className="v2-spellbook-tab-count">{tabCountLabel}</small>
          </span>
        </button>
      );
    })}
    <button
      type="button"
      className="v2-spellbook-close"
      onClick={onClose}
      aria-label="Close spellbook"
      title="Close (Esc)"
    >
      ×
    </button>
  </nav>
);

const SpellbookConfiguredBody = ({
  config,
  resources,
  resourceMax,
  preparedSpellIds,
  preparedLimitsByClass,
  spellbookSectionItems,
  togglePreparedSpell,
  renderSpellbookIcons,
  renderMetamagicSpellbookIcons,
}) => (
  <div className="v2-spellbook-body">
    <aside className="v2-spellbook-class-rail">
      <div className="v2-spellbook-class-crest">
        <img src={config.crest} alt={config.label} draggable={false} />
      </div>
      <div className="v2-spellbook-class-badge">Lv {config.classLevel}</div>
    </aside>

    <div className="v2-spellbook-content">
      <div className="v2-spellbook-subheader">
        <div className="v2-spellbook-oath">{config.subclassLabel}</div>
        <div className="v2-spellbook-stat-strip" aria-label="Spellbook stats">
          <span
            className="v2-spellbook-stat-pill"
            title={`Spellcasting ability: ${config.abilityLabel}`}
          >
            <span className="v2-spellbook-stat-glyph">★</span>
            <strong>{config.abilityLabel}</strong>
          </span>
          <span className="v2-spellbook-stat-pill" title="Spell Attack Modifier">
            <img src={SpellSlotIcon} alt="" draggable={false} />
            <strong>{config.spellAttackMod}</strong>
          </span>
          <span className="v2-spellbook-stat-pill" title="Spell Save DC">
            <span className="v2-spellbook-stat-glyph">DC</span>
            <strong>{config.spellSaveDC}</strong>
          </span>
        </div>
      </div>

      <div className="v2-spellbook-pane">
        {config.sections.map((section) => {
          const isPrepared = section.id === "prepared";
          const isMetamagic = section.source === "metamagic";
          const items = isMetamagic
            ? METAMAGIC_OPTIONS
            : spellbookSectionItems[section.id] ?? [];
          const tier = section.slotPipsKey;
          const slotsMax =
            tier !== undefined ? resourceMax.spellSlots?.[tier] ?? 0 : 0;
          const slotsRemaining =
            tier !== undefined ? resources.spellSlots?.[tier] ?? 0 : 0;
          const effectivePreparedLimit =
            preparedLimitsByClass[config.id] ?? config.preparedLimit;
          const trailingEmpty =
            isPrepared && effectivePreparedLimit
              ? Math.max(0, effectivePreparedLimit - items.length)
              : 0;

          const preparedSet = new Set(preparedSpellIds[config.id] ?? []);
          const isToggleRow =
            isPrepared || PREPARED_TOGGLE_ROW_KEYS.has(section.rowKey);
          const isCapReached =
            typeof effectivePreparedLimit === "number" &&
            preparedSet.size >= effectivePreparedLimit;
          const onSpellClick = isToggleRow
            ? (action) => togglePreparedSpell(config.id, action.id)
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
);

const SpellbookLegacyBody = ({ rows, renderSpellbookIcons }) => (
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
          {renderSpellbookIcons(rows.classActions)}
        </div>
      </section>

      <section className="v2-spellbook-row">
        <h3>Spells</h3>
        <div className="v2-spellbook-icon-row">
          {renderSpellbookIcons(rows.spellActions)}
        </div>
      </section>

      <section
        className="v2-spellbook-prepared-row"
        aria-label="Prepared strip"
      >
        <span className="v2-spellbook-prepared-label">Prepared</span>
        <div className="v2-spellbook-icon-row is-prepared">
          {renderSpellbookIcons(rows.preparedActions)}
        </div>
      </section>

      {rows.tierRows.map((row) => (
        <section key={row.tierId} className="v2-spellbook-tier-row">
          <span className="v2-spellbook-tier-label">{row.tierId}</span>
          <div className="v2-spellbook-icon-row">
            {renderSpellbookIcons(row.actions)}
          </div>
        </section>
      ))}
    </div>
  </div>
);

const SpellbookOverlay = forwardRef((props, popupRef) => {
  const {
    isOpen,
    spellbookDragState,
    spellbookPosition,
    activeSpellbookTab,
    activeSpellbookConfig,
    preparedLimitsByClass,
    preparedSpellIds,
    spellbookActionsByTab,
    spellbookSectionItems,
    spellbookActionRows,
    resources,
    resourceMax,
    onSelectTab,
    onClose,
    onHeaderPointerDown,
    togglePreparedSpell,
    renderSpellbookIcons,
    renderMetamagicSpellbookIcons,
  } = props;

  if (!isOpen) {
    return null;
  }

  const popupClassName = spellbookDragState
    ? "v2-spellbook-popup is-moved is-dragging"
    : spellbookPosition
      ? "v2-spellbook-popup is-moved"
      : "v2-spellbook-popup";

  const popupStyle = spellbookPosition
    ? {
        left: `${spellbookPosition.left}px`,
        top: `${spellbookPosition.top}px`,
      }
    : undefined;

  return (
    <div className="v2-spellbook-layer" aria-hidden={!isOpen}>
      <section
        ref={popupRef}
        className={popupClassName}
        role="dialog"
        aria-modal="false"
        aria-label="Spellbook"
        style={popupStyle}
      >
        <SpellbookTabStrip
          activeSpellbookTab={activeSpellbookTab}
          preparedLimitsByClass={preparedLimitsByClass}
          preparedSpellIds={preparedSpellIds}
          spellbookActionsByTab={spellbookActionsByTab}
          onSelectTab={onSelectTab}
          onClose={onClose}
          onPointerDown={onHeaderPointerDown}
        />

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
            onHeaderPointerDown(event);
          }}
        >
          {activeSpellbookConfig ? (
            <SpellbookConfiguredBody
              config={activeSpellbookConfig}
              resources={resources}
              resourceMax={resourceMax}
              preparedSpellIds={preparedSpellIds}
              preparedLimitsByClass={preparedLimitsByClass}
              spellbookSectionItems={spellbookSectionItems}
              togglePreparedSpell={togglePreparedSpell}
              renderSpellbookIcons={renderSpellbookIcons}
              renderMetamagicSpellbookIcons={renderMetamagicSpellbookIcons}
            />
          ) : (
            <SpellbookLegacyBody
              rows={spellbookActionRows}
              renderSpellbookIcons={renderSpellbookIcons}
            />
          )}
        </div>
      </section>
    </div>
  );
});

SpellbookOverlay.displayName = "SpellbookOverlay";

export default SpellbookOverlay;
