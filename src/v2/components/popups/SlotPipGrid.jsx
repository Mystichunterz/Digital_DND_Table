import SpellSlotIcon from "../../../assets/resources/spell_slot.png";

const SlotPipGrid = ({ remaining, max, label }) => {
  if (!max || max <= 0) {
    return null;
  }

  const filled = Math.max(0, Math.min(remaining ?? 0, max));
  const empty = max - filled;
  const cells = [];

  for (let index = 0; index < filled; index += 1) {
    cells.push(
      <img
        key={`f-${index}`}
        className="v2-slot-pip is-filled"
        src={SpellSlotIcon}
        alt=""
        draggable={false}
      />,
    );
  }
  for (let index = 0; index < empty; index += 1) {
    cells.push(
      <img
        key={`e-${index}`}
        className="v2-slot-pip is-empty"
        src={SpellSlotIcon}
        alt=""
        draggable={false}
      />,
    );
  }

  return (
    <div
      className="v2-slot-pip-stack"
      role="img"
      aria-label={
        typeof label === "string"
          ? `${label}: ${filled} of ${max} slots remaining`
          : `${filled} of ${max} slots remaining`
      }
    >
      {label && <span className="v2-slot-pip-numeral">{label}</span>}
      <div className="v2-slot-pip-grid">{cells}</div>
    </div>
  );
};

export default SlotPipGrid;
