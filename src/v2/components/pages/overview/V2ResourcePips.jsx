import { useEffect, useRef, useState } from "react";
import SpellSlotIcon from "../../../../assets/resources/spell_slot.png";
import ShortRestIcon from "../../../../assets/resources/short_rest.webp";
import LongRestIcon from "../../../../assets/resources/long_rest.png";
import NewTurnIcon from "../../../../assets/resources/new_turn.png";
import PreparedSpellsIcon from "../../../../assets/popups/spellbook/Prepared_Spells_Icon.webp";
import {
  COUNTED_RESOURCES,
  SINGLE_RESOURCES,
  TIER_KEYS,
  TIER_LABELS,
} from "./resourcePips/catalog";
import {
  renderCountedIconBox,
  renderSingleIconBox,
  renderSpellSlotPips,
} from "./resourcePips/PipBoxes";
import ConfigRow from "./resourcePips/ConfigRow";

const V2ResourcePips = ({
  resources,
  max,
  onNewTurn,
  onShortRest,
  onLongRest,
  onAdjust,
  onUpdateMax,
  onResetDefaults,
  preparedLimitsByClass,
  preparedClassLabels,
  onUpdatePreparedLimit,
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const configWrapperRef = useRef(null);
  // Caches the last non-zero max per key so the eye toggle can restore the
  // resource to its prior value rather than always defaulting to 1.
  const lastVisibleMaxRef = useRef({ spellSlots: {} });

  useEffect(() => {
    if (!isConfigOpen) return undefined;

    const handlePointerDown = (event) => {
      const wrapper = configWrapperRef.current;
      if (wrapper && !wrapper.contains(event.target)) {
        setIsConfigOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsConfigOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isConfigOpen]);

  const handleResetDefaults = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Reset all resource maximums and current values to the character defaults?",
      )
    ) {
      return;
    }
    onResetDefaults?.();
  };

  const toggleResourceVisible = (resourceKey, currentValue) => {
    if (currentValue > 0) {
      lastVisibleMaxRef.current[resourceKey] = currentValue;
      onUpdateMax(resourceKey, 0);
    } else {
      const remembered = lastVisibleMaxRef.current[resourceKey];
      onUpdateMax(resourceKey, remembered > 0 ? remembered : 1);
    }
  };

  const toggleSpellSlotVisible = (tier, currentValue) => {
    if (currentValue > 0) {
      lastVisibleMaxRef.current.spellSlots[tier] = currentValue;
      onUpdateMax("spellSlots", 0, tier);
    } else {
      const remembered = lastVisibleMaxRef.current.spellSlots[tier];
      onUpdateMax("spellSlots", remembered > 0 ? remembered : 1, tier);
    }
  };

  const tierBoxes = TIER_KEYS.map((tier) => ({
    tier,
    tierMax: max.spellSlots?.[tier] ?? 0,
    tierCurrent: resources.spellSlots?.[tier] ?? 0,
  })).filter((entry) => entry.tierMax > 0);

  return (
    <div className="v2-resource-bar-section">
      <div className="v2-resource-bar-row">
        <div
          className="v2-resource-bar"
          role="region"
          aria-label="Action resources and spell slots"
        >
          {SINGLE_RESOURCES.filter((entry) => (max[entry.key] ?? 0) > 0).map(
            (resource) =>
              renderSingleIconBox(
                resource,
                resources[resource.key] ?? 0,
                (delta) => onAdjust(resource.key, delta),
              ),
          )}

          {COUNTED_RESOURCES.filter((entry) => (max[entry.key] ?? 0) > 0).map(
            (resource) =>
              renderCountedIconBox(
                resource,
                resources[resource.key] ?? 0,
                max[resource.key],
                (delta) => onAdjust(resource.key, delta),
              ),
          )}

          {tierBoxes.map(({ tier, tierMax, tierCurrent }) => (
            <div
              key={tier}
              className="v2-resource-box v2-resource-box-spell-slot"
            >
              <span className="v2-resource-box-label">{TIER_LABELS[tier]}</span>
              <div className="v2-resource-box-body">
                {renderSpellSlotPips(tierCurrent, tierMax, (delta) =>
                  onAdjust("spellSlots", delta, tier),
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          className="v2-resource-bar-actions"
          role="group"
          aria-label="Rest and configuration"
        >
          <button
            type="button"
            className="v2-resource-rest v2-resource-rest-new-turn"
            onClick={onNewTurn}
            title="New turn (restore Action, Bonus Action, and Reaction)"
            aria-label="New turn"
          >
            <img src={NewTurnIcon} alt="" draggable={false} />
          </button>

          <button
            type="button"
            className="v2-resource-rest v2-resource-rest-short"
            onClick={onShortRest}
            title="Short rest (restore action economy and Channel Oath)"
            aria-label="Short rest"
          >
            <img src={ShortRestIcon} alt="" draggable={false} />
          </button>

          <button
            type="button"
            className="v2-resource-rest v2-resource-rest-long"
            onClick={onLongRest}
            title="Long rest (restore all resources)"
            aria-label="Long rest"
          >
            <img src={LongRestIcon} alt="" draggable={false} />
          </button>

          <div className="v2-resource-config-wrapper" ref={configWrapperRef}>
            <button
              type="button"
              className={
                isConfigOpen
                  ? "v2-resource-config-toggle is-active"
                  : "v2-resource-config-toggle"
              }
              onClick={() => setIsConfigOpen((current) => !current)}
              title="Configure resource maximums"
              aria-label="Configure resources"
              aria-expanded={isConfigOpen}
            >
              ⚙
            </button>

            {isConfigOpen && (
              <div
                className="v2-resource-config-card"
                role="dialog"
                aria-label="Configure resource maximums"
              >
                <div className="v2-resource-config-header">
                  <span>Resource Maximums</span>
                  <div className="v2-resource-config-header-actions">
                    <button
                      type="button"
                      className="v2-resource-config-reset"
                      onClick={handleResetDefaults}
                      title="Reset all maxes and current values to character defaults"
                    >
                      Reset Defaults
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfigOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>

                <section className="v2-resource-config-section">
                  <h3 className="v2-resource-config-section-title">
                    Resources
                  </h3>
                  <div className="v2-resource-config-grid">
                    {[...SINGLE_RESOURCES, ...COUNTED_RESOURCES].map(
                      (resource) => {
                        const value = max[resource.key] ?? 0;
                        return (
                          <ConfigRow
                            key={resource.key}
                            iconSrc={resource.iconSrc}
                            label={resource.label}
                            value={value}
                            onChange={(nextValue) =>
                              onUpdateMax(resource.key, nextValue)
                            }
                            onToggleVisible={() =>
                              toggleResourceVisible(resource.key, value)
                            }
                          />
                        );
                      },
                    )}
                  </div>
                </section>

                <section className="v2-resource-config-section">
                  <h3 className="v2-resource-config-section-title">
                    Spell Slots
                  </h3>
                  <div className="v2-resource-config-grid">
                    {TIER_KEYS.map((tier) => {
                      const value = max.spellSlots?.[tier] ?? 0;
                      return (
                        <ConfigRow
                          key={`tier-${tier}`}
                          iconSrc={SpellSlotIcon}
                          label={`Tier ${TIER_LABELS[tier]}`}
                          value={value}
                          onChange={(nextValue) =>
                            onUpdateMax("spellSlots", nextValue, tier)
                          }
                          onToggleVisible={() =>
                            toggleSpellSlotVisible(tier, value)
                          }
                        />
                      );
                    })}
                  </div>
                </section>

                {preparedLimitsByClass &&
                  Object.keys(preparedLimitsByClass).length > 0 && (
                    <section className="v2-resource-config-section">
                      <h3 className="v2-resource-config-section-title">
                        Prepared Spells
                      </h3>
                      <div className="v2-resource-config-grid">
                        {Object.entries(preparedLimitsByClass).map(
                          ([classId, value]) => (
                            <ConfigRow
                              key={`prepared-${classId}`}
                              iconSrc={PreparedSpellsIcon}
                              label={
                                preparedClassLabels?.[classId] ?? classId
                              }
                              value={value ?? 0}
                              onChange={(nextValue) =>
                                onUpdatePreparedLimit?.(classId, nextValue)
                              }
                            />
                          ),
                        )}
                      </div>
                    </section>
                  )}

                <p className="v2-resource-config-hint">
                  Click the eye to hide a resource; click again to restore.
                  Click pips to spend, right-click to restore.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default V2ResourcePips;
