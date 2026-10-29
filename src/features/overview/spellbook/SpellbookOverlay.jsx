import { forwardRef } from "react";
import SpellbookRow from "./SpellbookRow";
import { getTabById } from "@/data/character/spellbookTabs";
import { SPELLBOOK_TABS } from "./spellbookConfig";
import { METAMAGIC_OPTIONS } from "../actions/metamagicOptions";
import { PREPARED_TOGGLE_ROW_KEYS } from "./preparedSpells";
import SpellSlotIcon from "@/assets/resources/spell_slot.png";

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
    className="spellbook-tab-strip"
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
        ? (preparedSpellIds[tab.id]?.length ?? 0)
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
              ? "spellbook-tab is-active"
              : "spellbook-tab"
          }
          onClick={() => onSelectTab(tab.id)}
        >
          <span>
            {tab.label}{" "}
            <small className="spellbook-tab-count">{tabCountLabel}</small>
          </span>
        </button>
      );
    })}
    <button
      type="button"
      className="spellbook-close"
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
  <div className="spellbook-body">
    <aside className="spellbook-class-rail">
      <div className="spellbook-class-crest">
        <img src={config.crest} alt={config.label} draggable={false} />
      </div>
      <div className="spellbook-class-badge">Lv {config.classLevel}</div>
    </aside>

    <div className="spellbook-content">
      <div className="spellbook-subheader">
        <div className="spellbook-oath">{config.subclassLabel}</div>
        <div className="spellbook-stat-strip" aria-label="Spellbook stats">
          <span
            className="spellbook-stat-pill"
            title={`Spellcasting ability: ${config.abilityLabel}`}
          >
            <span className="spellbook-stat-glyph">★</span>
            <strong>{config.abilityLabel}</strong>
          </span>
          <span className="spellbook-stat-pill" title="Spell Attack Modifier">
            <img src={SpellSlotIcon} alt="" draggable={false} />
            <strong>{config.spellAttackMod}</strong>
          </span>
          <span className="spellbook-stat-pill" title="Spell Save DC">
            <span className="spellbook-stat-glyph">DC</span>
            <strong>{config.spellSaveDC}</strong>
          </span>
        </div>
      </div>

      <div className="spellbook-pane">
        {config.sections.map((section) => {
          const isPrepared = section.id === "prepared";
          const isMetamagic = section.source === "metamagic";
          const items = isMetamagic
            ? METAMAGIC_OPTIONS
            : (spellbookSectionItems[section.id] ?? []);
          const tier = section.slotPipsKey;
          const slotsMax =
            tier !== undefined ? (resourceMax.spellSlots?.[tier] ?? 0) : 0;
          const slotsRemaining =
            tier !== undefined ? (resources.spellSlots?.[tier] ?? 0) : 0;
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
  <div className="spellbook-body">
    <aside className="spellbook-class-rail" aria-hidden="true">
      <div className="spellbook-class-badge">Lv 9</div>
      <div className="spellbook-slot-pips">
        <span />
        <span />
        <span />
      </div>
    </aside>

    <div className="spellbook-grid">
      <section className="spellbook-row">
        <h3>Class Actions</h3>
        <div className="spellbook-icon-row">
          {renderSpellbookIcons(rows.classActions)}
        </div>
      </section>

      <section className="spellbook-row">
        <h3>Spells</h3>
        <div className="spellbook-icon-row">
          {renderSpellbookIcons(rows.spellActions)}
        </div>
      </section>

      <section className="spellbook-prepared-row" aria-label="Prepared strip">
        <span className="spellbook-prepared-label">Prepared</span>
        <div className="spellbook-icon-row is-prepared">
          {renderSpellbookIcons(rows.preparedActions)}
        </div>
      </section>

      {rows.tierRows.map((row) => (
        <section key={row.tierId} className="spellbook-tier-row">
          <span className="spellbook-tier-label">{row.tierId}</span>
          <div className="spellbook-icon-row">
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
    ? "spellbook-popup is-moved is-dragging"
    : spellbookPosition
      ? "spellbook-popup is-moved"
      : "spellbook-popup";

  const popupStyle = spellbookPosition
    ? {
        left: `${spellbookPosition.left}px`,
        top: `${spellbookPosition.top}px`,
      }
    : undefined;

  return (
    <div className="spellbook-layer" aria-hidden={!isOpen}>
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
          className="spellbook-surface"
          onPointerDown={(event) => {
            if (
              event.target.closest(
                "button, input, .spellbook-icon, .spellbook-stat-pill, .spellbook-stat-flat, .spell-hover-popup-trigger",
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
