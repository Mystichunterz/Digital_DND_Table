import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import banishingSmiteIcon from "../../../../assets/actions/spells/Banishing_Smite_Unfaded_Icon.webp";
import blindingSmiteIcon from "../../../../assets/actions/spells/Blinding_Smite_Unfaded_Icon.webp";
import brandingSmiteIcon from "../../../../assets/actions/spells/Branding_Smite_Unfaded_Icon.webp";
import commandIcon from "../../../../assets/actions/spells/Command_Unfaded_Icon.webp";
import compelledDuelIcon from "../../../../assets/actions/spells/Compelled_Duel_Unfaded_Icon.webp";
import divineFavorIcon from "../../../../assets/actions/spells/Divine_Favor_Unfaded_Icon.webp";
import divineSmiteIcon from "../../../../assets/actions/spells/Divine_Smite_Unfaded_Icon.webp";
import layOnHandsIcon from "../../../../assets/actions/spells/Lay_on_Hands_Unfaded_Icon.webp";
import thunderousSmiteIcon from "../../../../assets/actions/spells/Thunderous_Smite_Unfaded_Icon.webp";
import vowOfEnmityIcon from "../../../../assets/actions/spells/Vow_of_Enmity_Unfaded_Icon.webp";
import wrathfulSmiteIcon from "../../../../assets/actions/spells/Wrathful_Smite_Unfaded_Icon.webp";
import dashIcon from "../../../../assets/actions/common/Dash_Unfaded_Icon.webp";
import disengageIcon from "../../../../assets/actions/common/Disengage_Unfaded_Icon.webp";
import helpIcon from "../../../../assets/actions/common/Help_Unfaded_Icon.webp";
import hideIcon from "../../../../assets/actions/common/Hide_Unfaded_Icon.webp";
import improvisedMeleeWeaponIcon from "../../../../assets/actions/common/Improvised_Melee_Weapon_Unfaded_Icon.webp";
import jumpIcon from "../../../../assets/actions/common/Jump_Unfaded_Icon.webp";
import throwIcon from "../../../../assets/actions/common/Throw_Unfaded_Icon.webp";
import throwWeaponIcon from "../../../../assets/actions/common/Throw_Weapon_Unfaded_Icon.webp";
import toggleNonLethalAttacksIcon from "../../../../assets/actions/common/Toggle_Non-Lethal_Attacks_Unfaded_Icon.webp";
import mainHandAttackIcon from "../../../../assets/actions/weapons/Main_Hand_Attack_Unfaded_Icon.webp";
import rangedAttackIcon from "../../../../assets/actions/weapons/Ranged_Attack_Unfaded_Icon.webp";

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

const ACTION_LIBRARY = {
  common: [
    {
      id: "dash",
      name: "Dash",
      short: "DA",
      icon: dashIcon,
      keybind: "Z",
      section: "mobility",
      kind: "action",
      tier: "I",
      tone: "steel",
    },
    {
      id: "jump",
      name: "Jump",
      short: "JP",
      icon: jumpIcon,
      keybind: "X",
      section: "mobility",
      kind: "bonus",
      tier: "I",
      tone: "steel",
    },
    {
      id: "shove",
      name: "Shove",
      short: "SH",
      icon: improvisedMeleeWeaponIcon,
      section: "mobility",
      kind: "bonus",
      tier: "I",
      tone: "steel",
    },
    {
      id: "disengage",
      name: "Disengage",
      short: "DG",
      icon: disengageIcon,
      section: "mobility",
      kind: "action",
      tier: "I",
      tone: "steel",
    },
    {
      id: "help",
      name: "Help",
      short: "HP",
      icon: helpIcon,
      section: "support",
      kind: "action",
      tier: "I",
      tone: "blue",
    },
    {
      id: "throw",
      name: "Throw",
      short: "TH",
      icon: throwIcon,
      section: "offense",
      kind: "action",
      tier: "I",
      tone: "red",
    },
    {
      id: "main-attack",
      name: "Main Attack",
      short: "AT",
      icon: mainHandAttackIcon,
      section: "offense",
      kind: "action",
      tier: "I",
      tone: "gold",
    },
    {
      id: "offhand-attack",
      name: "Offhand",
      short: "OH",
      icon: throwWeaponIcon,
      section: "offense",
      kind: "bonus",
      tier: "I",
      tone: "gold",
    },
    {
      id: "ranged-attack",
      name: "Ranged",
      short: "RA",
      icon: rangedAttackIcon,
      section: "offense",
      kind: "action",
      tier: "I",
      tone: "red",
    },
    {
      id: "hide",
      name: "Hide",
      short: "HD",
      icon: hideIcon,
      section: "mobility",
      kind: "bonus",
      tier: "I",
      tone: "blue",
    },
    {
      id: "dodge",
      name: "Dodge",
      short: "DD",
      icon: toggleNonLethalAttacksIcon,
      section: "support",
      kind: "action",
      tier: "I",
      tone: "blue",
    },
    {
      id: "ready",
      name: "Ready",
      short: "RD",
      section: "support",
      kind: "reaction",
      tier: "II",
      tone: "purple",
    },
    {
      id: "improvise",
      name: "Improvise",
      short: "IM",
      icon: improvisedMeleeWeaponIcon,
      section: "support",
      kind: "utility",
      tier: "II",
      tone: "purple",
    },
  ],
  paladin: [
    {
      id: "smite",
      name: "Divine Smite",
      short: "SM",
      icon: divineSmiteIcon,
      section: "offense",
      kind: "action",
      tier: "I",
      tone: "gold",
    },
    {
      id: "thunderous-smite",
      name: "Thunderous Smite",
      short: "TS",
      icon: thunderousSmiteIcon,
      section: "offense",
      kind: "bonus",
      tier: "I",
      tone: "purple",
    },
    {
      id: "wrathful-smite",
      name: "Wrathful Smite",
      short: "WS",
      icon: wrathfulSmiteIcon,
      section: "offense",
      kind: "bonus",
      tier: "I",
      tone: "purple",
    },
    {
      id: "compelled-duel",
      name: "Compelled Duel",
      short: "CD",
      icon: compelledDuelIcon,
      section: "support",
      kind: "action",
      tier: "I",
      tone: "blue",
    },
    {
      id: "vow-of-enmity",
      name: "Vow of Enmity",
      short: "VE",
      icon: vowOfEnmityIcon,
      section: "support",
      kind: "bonus",
      tier: "II",
      tone: "purple",
    },
    {
      id: "lay-on-hands",
      name: "Lay on Hands",
      short: "LH",
      icon: layOnHandsIcon,
      section: "support",
      kind: "action",
      tier: "I",
      tone: "blue",
    },
    {
      id: "divine-favor",
      name: "Divine Favor",
      short: "DF",
      icon: divineFavorIcon,
      section: "support",
      kind: "bonus",
      tier: "I",
      tone: "gold",
    },
    {
      id: "command",
      name: "Command",
      short: "CM",
      icon: commandIcon,
      section: "offense",
      kind: "action",
      tier: "I",
      tone: "red",
    },
    {
      id: "branding-smite",
      name: "Branding Smite",
      short: "BS",
      icon: brandingSmiteIcon,
      section: "offense",
      kind: "bonus",
      tier: "II",
      tone: "gold",
    },
    {
      id: "blinding-smite",
      name: "Blinding Smite",
      short: "BL",
      icon: blindingSmiteIcon,
      section: "offense",
      kind: "bonus",
      tier: "III",
      tone: "gold",
    },
    {
      id: "banishing-smite",
      name: "Banishing Smite",
      short: "BN",
      icon: banishingSmiteIcon,
      section: "offense",
      kind: "bonus",
      tier: "V",
      tone: "gold",
    },
  ],
  items: [
    {
      id: "throw-potion",
      name: "Throw Potion",
      short: "PT",
      section: "support",
      kind: "action",
      tier: "I",
      tone: "green",
    },
    {
      id: "coat-weapon",
      name: "Coat Weapon",
      short: "CW",
      section: "offense",
      kind: "bonus",
      tier: "I",
      tone: "green",
    },
    {
      id: "bomb",
      name: "Bomb",
      short: "BM",
      section: "offense",
      kind: "action",
      tier: "II",
      tone: "red",
    },
    {
      id: "scroll",
      name: "Scroll",
      short: "SC",
      section: "support",
      kind: "utility",
      tier: "II",
      tone: "blue",
    },
    {
      id: "elixir",
      name: "Elixir",
      short: "EX",
      section: "support",
      kind: "utility",
      tier: "III",
      tone: "green",
    },
  ],
  passives: [
    {
      id: "great-weapon-master",
      name: "GWM",
      short: "GW",
      section: "offense",
      kind: "utility",
      tier: "I",
      tone: "red",
    },
    {
      id: "opportunity-attack",
      name: "Opportunity",
      short: "OA",
      section: "support",
      kind: "reaction",
      tier: "I",
      tone: "blue",
    },
    {
      id: "divine-health",
      name: "Divine Health",
      short: "DH",
      section: "support",
      kind: "utility",
      tier: "I",
      tone: "gold",
    },
    {
      id: "aura",
      name: "Aura",
      short: "AU",
      section: "support",
      kind: "utility",
      tier: "II",
      tone: "purple",
    },
  ],
  custom: [
    {
      id: "quick-heal",
      name: "Quick Heal",
      short: "QH",
      section: "support",
      kind: "bonus",
      tier: "I",
      tone: "blue",
    },
    {
      id: "burst",
      name: "Burst",
      short: "BU",
      section: "offense",
      kind: "action",
      tier: "III",
      tone: "red",
    },
    {
      id: "gap-close",
      name: "Gap Close",
      short: "GC",
      section: "mobility",
      kind: "bonus",
      tier: "II",
      tone: "steel",
    },
  ],
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
  const [actionLayouts, setActionLayouts] = useState(() => {
    const initialLayouts = {};

    Object.entries(ACTION_LIBRARY).forEach(([categoryId, actions]) => {
      initialLayouts[categoryId] = buildInitialCategoryLayout(actions);
    });

    return initialLayouts;
  });
  const [draggedAction, setDraggedAction] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const gridClusterRef = useRef(null);

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
