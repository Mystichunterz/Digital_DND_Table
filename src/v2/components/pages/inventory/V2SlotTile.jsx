import { useRef, useState } from "react";
import ItemHoverPopup from "../../popups/ItemHoverPopup";

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
  equippedBy = null,
  popupPosition = "horizontal",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const tileRef = useRef(null);

  const sizeClass = size ? `is-size-${size}` : "is-size-flex";
  const rarityClass = item ? RARITY_CLASS[item.rarity] ?? "" : "";
  const stateClass = item ? "is-filled" : "is-empty";

  return (
    <div
      ref={tileRef}
      className={`v2-slot-tile ${stateClass} ${sizeClass} ${rarityClass}`.trim()}
      role="img"
      aria-label={ariaLabel ?? (item ? item.name : `Empty ${slotLabel ?? "slot"}`)}
      onMouseEnter={() => {
        if (item) setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {item ? (
        <>
          {item.icon ? (
            <img
              src={item.icon}
              alt=""
              className="v2-slot-tile-icon"
              draggable={false}
            />
          ) : (
            <span className="v2-slot-tile-fallback">{item.short ?? "??"}</span>
          )}
          {item.stack > 1 && (
            <span className="v2-slot-tile-stack">{item.stack}</span>
          )}
        </>
      ) : (
        <span className="v2-slot-tile-glyph" aria-hidden="true">
          {slotGlyph ?? ""}
        </span>
      )}

      {item && (isHovered || isPinned) && (
        <ItemHoverPopup
          item={item}
          equippedBy={equippedBy}
          triggerRef={tileRef}
          onPinChange={setIsPinned}
          positionPreference={popupPosition}
        />
      )}
    </div>
  );
};

export default V2SlotTile;
