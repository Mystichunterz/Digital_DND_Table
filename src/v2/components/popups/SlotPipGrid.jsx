const SlotPipGrid = ({ remaining, max, label }) => {
  if (!max || max <= 0) {
    return null;
  }

  const filled = Math.max(0, Math.min(remaining ?? 0, max));
  const empty = max - filled;
  const cells = [];

  for (let index = 0; index < filled; index += 1) {
    cells.push(
      <span key={`f-${index}`} className="v2-slot-pip is-filled" />,
    );
  }
  for (let index = 0; index < empty; index += 1) {
    cells.push(
      <span key={`e-${index}`} className="v2-slot-pip is-empty" />,
    );
  }

  return (
    <div
      className="v2-slot-pip-grid"
      role="img"
      aria-label={
        label ?? `${filled} of ${max} slots remaining`
      }
    >
      {cells}
      {label && <span className="v2-slot-pip-label">{label}</span>}
    </div>
  );
};

export default SlotPipGrid;
