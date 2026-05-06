import MetamagicHoverPopup from "../../../popups/MetamagicHoverPopup";
import {
  METAMAGIC_OPTIONS,
  METAMAGIC_SLOT_COUNT,
} from "./metamagicOptions";

const MetamagicTray = () => (
  <aside
    className="v2-actions-metamagic-rail"
    aria-label="Metamagic options"
  >
    {Array.from({ length: METAMAGIC_SLOT_COUNT }).map((_, slotIndex) => {
      const option = METAMAGIC_OPTIONS[slotIndex];

      if (!option) {
        return (
          <div
            key={`metamagic-empty-${slotIndex}`}
            className="v2-metamagic-tile v2-metamagic-tile-empty"
            aria-hidden="true"
          />
        );
      }

      return (
        <MetamagicHoverPopup
          key={option.id}
          metamagic={option}
          positionPreference="horizontal"
        >
          <button
            type="button"
            className="v2-metamagic-tile"
            title={option.name}
            aria-label={option.name}
          >
            <img
              src={option.icon}
              alt=""
              className="v2-metamagic-icon"
              draggable={false}
            />
          </button>
        </MetamagicHoverPopup>
      );
    })}
  </aside>
);

export default MetamagicTray;
