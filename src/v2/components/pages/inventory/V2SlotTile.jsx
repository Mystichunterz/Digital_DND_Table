const RARITY_CLASS = {
  common: "is-rarity-common",
  uncommon: "is-rarity-uncommon",
  rare: "is-rarity-rare",
  veryRare: "is-rarity-very-rare",
  legendary: "is-rarity-legendary",
};

const V2SlotTile = ({
  item,
  slotLabel,
  slotGlyph,
  size,
  ariaLabel,
}) => {
  const sizeClass = size ? `is-size-${size}` : "is-size-flex";
  const rarityClass = item ? RARITY_CLASS[item.rarity] ?? "" : "";
  const stateClass = item ? "is-filled" : "is-empty";

  return (
    <div
      className={`v2-slot-tile ${stateClass} ${sizeClass} ${rarityClass}`.trim()}
      role="img"
      aria-label={ariaLabel ?? (item ? item.name : `Empty ${slotLabel ?? "slot"}`)}
    >
      {item ? (
        <>
          <img
            src={item.icon}
            alt=""
            className="v2-slot-tile-icon"
            draggable={false}
          />
          {item.stack > 1 && (
            <span className="v2-slot-tile-stack">{item.stack}</span>
          )}
        </>
      ) : (
        <span className="v2-slot-tile-glyph" aria-hidden="true">
          {slotGlyph ?? ""}
        </span>
      )}
    </div>
  );
};

export default V2SlotTile;
