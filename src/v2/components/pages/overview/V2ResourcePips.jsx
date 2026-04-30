import { useState } from "react";
import ActionIcon from "../../../../assets/resources/action.png";
import BonusActionIcon from "../../../../assets/resources/bonus_action.png";
import ReactionIcon from "../../../../assets/resources/reaction.png";
import ChannelOathIcon from "../../../../assets/resources/channel_oath.png";
import DivineSenseIcon from "../../../../assets/resources/divine_sense.webp";
import LayOnHandsIcon from "../../../../assets/resources/lay_on_hands.png";
import SorceryPointsIcon from "../../../../assets/resources/sorcery_points.png";
import SpellSlotIcon from "../../../../assets/resources/spell_slot.png";

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

const ConfigRow = ({ label, value, onChange }) => {
  const handleChange = (event) => {
    const parsed = parseInt(event.target.value, 10);
    onChange(Number.isNaN(parsed) ? 0 : Math.max(0, parsed));
  };

  return (
    <label className="v2-resource-config-row">
      <span>{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={handleChange}
        className="v2-resource-config-input"
      />
    </label>
  );
};

const V2ResourcePips = ({
  resources,
  max,
  onRest,
  onAdjust,
  onUpdateMax,
  onResetDefaults,
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

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

  const tierBoxes = TIER_KEYS.map((tier) => ({
    tier,
    tierMax: max.spellSlots?.[tier] ?? 0,
    tierCurrent: resources.spellSlots?.[tier] ?? 0,
  })).filter((entry) => entry.tierMax > 0);

  return (
    <div className="v2-resource-bar-section">
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
          <div key={tier} className="v2-resource-box v2-resource-box-spell-slot">
            <span className="v2-resource-box-label">{TIER_LABELS[tier]}</span>
            <div className="v2-resource-box-body">
              {renderSpellSlotPips(tierCurrent, tierMax, (delta) =>
                onAdjust("spellSlots", delta, tier),
              )}
            </div>
          </div>
        ))}

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

        <button
          type="button"
          className="v2-resource-rest"
          onClick={onRest}
          title="Restore all resources (long rest)"
          aria-label="Long rest"
        >
          Z
        </button>
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

          <div className="v2-resource-config-grid">
            {SINGLE_RESOURCES.map((resource) => (
              <ConfigRow
                key={resource.key}
                label={resource.label}
                value={max[resource.key] ?? 0}
                onChange={(value) => onUpdateMax(resource.key, value)}
              />
            ))}

            {COUNTED_RESOURCES.map((resource) => (
              <ConfigRow
                key={resource.key}
                label={resource.label}
                value={max[resource.key] ?? 0}
                onChange={(value) => onUpdateMax(resource.key, value)}
              />
            ))}

            {TIER_KEYS.map((tier) => (
              <ConfigRow
                key={`tier-${tier}`}
                label={`Spell Slot ${TIER_LABELS[tier]}`}
                value={max.spellSlots?.[tier] ?? 0}
                onChange={(value) => onUpdateMax("spellSlots", value, tier)}
              />
            ))}
          </div>

          <p className="v2-resource-config-hint">
            Set a maximum to 0 to hide the resource entirely. Click pips to
            spend; right-click to restore.
          </p>
        </div>
      )}
    </div>
  );
};

export default V2ResourcePips;
