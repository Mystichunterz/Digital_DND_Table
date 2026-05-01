import { useRef, useState } from "react";
import ActionIcon from "../../../../assets/resources/action.png";
import BonusActionIcon from "../../../../assets/resources/bonus_action.png";
import ReactionIcon from "../../../../assets/resources/reaction.png";
import ChannelOathIcon from "../../../../assets/resources/channel_oath.png";
import DivineSenseIcon from "../../../../assets/resources/divine_sense.webp";
import LayOnHandsIcon from "../../../../assets/resources/lay_on_hands.png";
import SorceryPointsIcon from "../../../../assets/resources/sorcery_points.png";
import SpellSlotIcon from "../../../../assets/resources/spell_slot.png";
import ShortRestIcon from "../../../../assets/resources/short_rest.webp";
import LongRestIcon from "../../../../assets/resources/long_rest.png";

const TIER_LABELS = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI" };
const TIER_KEYS = [1, 2, 3, 4, 5, 6];

const SINGLE_RESOURCES = [
  { key: "action", iconSrc: ActionIcon, kind: "action", label: "Action" },
  {
    key: "bonus",
    iconSrc: BonusActionIcon,
    kind: "bonus",
    label: "Bonus action",
  },
  { key: "reaction", iconSrc: ReactionIcon, kind: "reaction", label: "Reaction" },
  {
    key: "channelOath",
    iconSrc: ChannelOathIcon,
    kind: "channel-oath",
    label: "Channel Oath",
  },
];

const COUNTED_RESOURCES = [
  {
    key: "layOnHands",
    iconSrc: LayOnHandsIcon,
    kind: "lay-on-hands",
    label: "Lay on Hands",
  },
  {
    key: "sorceryPoints",
    iconSrc: SorceryPointsIcon,
    kind: "sorcery-points",
    label: "Sorcery Points",
  },
  {
    key: "divineSense",
    iconSrc: DivineSenseIcon,
    kind: "divine-sense",
    label: "Divine Sense",
  },
];

const handleContextDecrementOrIncrement = (event, onAdjust) => {
  event.preventDefault();
  onAdjust(1);
};

const renderSpellSlotPips = (current, max, onAdjust) => {
  const safeMax = Math.max(1, Math.min(max, 4));
  const pips = Array.from({ length: safeMax }, (_, index) => {
    const isAvailable = index < current;
    const className = isAvailable
      ? "v2-resource-pip v2-resource-pip-spell-slot is-available is-clickable"
      : "v2-resource-pip v2-resource-pip-spell-slot is-spent is-clickable";

    return (
      <button
        key={index}
        type="button"
        className={className}
        aria-label={isAvailable ? "Spell slot available" : "Spell slot spent"}
        title="Click to spend, right-click to restore"
        onClick={() => onAdjust(-1)}
        onContextMenu={(event) =>
          handleContextDecrementOrIncrement(event, onAdjust)
        }
      >
        <img src={SpellSlotIcon} alt="" draggable={false} />
      </button>
    );
  });

  return (
    <div className={`v2-resource-pip-grid is-count-${safeMax}`}>{pips}</div>
  );
};

const renderSingleIconBox = ({ key, iconSrc, kind, label }, current, onAdjust) => {
  const isAvailable = current > 0;
  const pipClass = isAvailable
    ? `v2-resource-pip v2-resource-pip-${kind} is-available is-clickable`
    : `v2-resource-pip v2-resource-pip-${kind} is-spent is-clickable`;

  return (
    <div key={key} className={`v2-resource-box v2-resource-box-${kind}`}>
      <div className="v2-resource-box-body">
        <button
          type="button"
          className={pipClass}
          aria-label={`${label} ${isAvailable ? "available" : "spent"}`}
          title="Click to spend, right-click to restore"
          onClick={() => onAdjust(-1)}
          onContextMenu={(event) =>
            handleContextDecrementOrIncrement(event, onAdjust)
          }
        >
          <img src={iconSrc} alt="" draggable={false} />
        </button>
      </div>
    </div>
  );
};

const renderCountedIconBox = (
  { key, iconSrc, kind, label },
  current,
  resourceMax,
  onAdjust,
) => {
  const isAvailable = current > 0;
  const pipClass = isAvailable
    ? `v2-resource-pip v2-resource-pip-${kind} is-counted is-available is-clickable`
    : `v2-resource-pip v2-resource-pip-${kind} is-counted is-spent is-clickable`;

  return (
    <div key={key} className={`v2-resource-box v2-resource-box-${kind}`}>
      <div className="v2-resource-box-body">
        <button
          type="button"
          className={pipClass}
          aria-label={`${label} ${current} of ${resourceMax}`}
          title="Click to spend, right-click to restore"
          onClick={() => onAdjust(-1)}
          onContextMenu={(event) =>
            handleContextDecrementOrIncrement(event, onAdjust)
          }
        >
          <img src={iconSrc} alt="" draggable={false} />
          <span className="v2-resource-pip-count-badge">{current}</span>
        </button>
      </div>
    </div>
  );
};

const EyeOpenIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosedIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M3 12s3.5 6 9 6c1.7 0 3.2-.4 4.5-1" />
    <path d="M21 12s-1.4-2.5-3.8-4.4" />
    <path d="M14.5 14.5a3 3 0 0 1-4.2-4.2" />
    <path d="M3 3l18 18" />
  </svg>
);

const ConfigRow = ({ iconSrc, label, value, onChange, onToggleVisible }) => {
  const handleInputChange = (event) => {
    const parsed = parseInt(event.target.value, 10);
    onChange(Number.isNaN(parsed) ? 0 : Math.max(0, parsed));
  };

  const isVisible = value > 0;

  return (
    <div className="v2-resource-config-row">
      <button
        type="button"
        className={
          isVisible
            ? "v2-resource-config-eye"
            : "v2-resource-config-eye is-hidden"
        }
        onClick={onToggleVisible}
        title={isVisible ? "Hide this resource" : "Show this resource"}
        aria-label={isVisible ? "Hide resource" : "Show resource"}
        aria-pressed={!isVisible}
      >
        {isVisible ? <EyeOpenIcon /> : <EyeClosedIcon />}
      </button>

      {iconSrc && (
        <img
          src={iconSrc}
          alt=""
          className="v2-resource-config-icon"
          draggable={false}
        />
      )}

      <span className="v2-resource-config-label">{label}</span>

      <div className="v2-resource-config-stepper">
        <button
          type="button"
          className="v2-resource-config-step"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value <= 0}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="number"
          min="0"
          value={value}
          onChange={handleInputChange}
          className="v2-resource-config-input"
          aria-label={`${label} maximum`}
        />
        <button
          type="button"
          className="v2-resource-config-step"
          onClick={() => onChange(value + 1)}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
};

const V2ResourcePips = ({
  resources,
  max,
  onShortRest,
  onLongRest,
  onAdjust,
  onUpdateMax,
  onResetDefaults,
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  // Caches the last non-zero max per key so the eye toggle can restore the
  // resource to its prior value rather than always defaulting to 1.
  const lastVisibleMaxRef = useRef({ spellSlots: {} });

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
        </div>
      </div>

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
              <button type="button" onClick={() => setIsConfigOpen(false)}>
                Close
              </button>
            </div>
          </div>

          <section className="v2-resource-config-section">
            <h3 className="v2-resource-config-section-title">Resources</h3>
            <div className="v2-resource-config-grid">
              {[...SINGLE_RESOURCES, ...COUNTED_RESOURCES].map((resource) => {
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
              })}
            </div>
          </section>

          <section className="v2-resource-config-section">
            <h3 className="v2-resource-config-section-title">Spell Slots</h3>
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

          <p className="v2-resource-config-hint">
            Click the eye to hide a resource; click again to restore. Click pips
            to spend, right-click to restore.
          </p>
        </div>
      )}
    </div>
  );
};

export default V2ResourcePips;
