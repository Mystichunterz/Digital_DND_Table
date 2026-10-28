import SpellSlotIcon from "../../../../../assets/resources/spell_slot.png";

const handleContextRestore = (event, onAdjust) => {
  event.preventDefault();
  onAdjust(1);
};

export const renderSpellSlotPips = (current, max, onAdjust) => {
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
        onContextMenu={(event) => handleContextRestore(event, onAdjust)}
      >
        <img src={SpellSlotIcon} alt="" draggable={false} />
      </button>
    );
  });

  return (
    <div className={`v2-resource-pip-grid is-count-${safeMax}`}>{pips}</div>
  );
};

export const renderSingleIconBox = (
  { key, iconSrc, kind, label },
  current,
  onAdjust,
) => {
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
          onContextMenu={(event) => handleContextRestore(event, onAdjust)}
        >
          <img src={iconSrc} alt="" draggable={false} />
        </button>
      </div>
    </div>
  );
};

export const renderCountedIconBox = (
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
          onContextMenu={(event) => handleContextRestore(event, onAdjust)}
        >
          <img src={iconSrc} alt="" draggable={false} />
          <span className="v2-resource-pip-count-badge">{current}</span>
        </button>
      </div>
    </div>
  );
};
