import { useCallback } from "react";
import SpellHoverPopup from "../../../popups/SpellHoverPopup";
import MetamagicHoverPopup from "../../../popups/MetamagicHoverPopup";

export const useSpellbookIconRenderers = ({ onDragStart, onDragEnd }) => {
  const renderSpellbookIcons = useCallback(
    (actions, options = {}) => {
      const { onSpellClick, preparedSet, isCapReached } = options;

      if (!actions.length) {
        return (
          <span className="v2-spellbook-row-empty">
            No spells in this group.
          </span>
        );
      }

      return actions.map((action) => {
        const isPrepared = preparedSet?.has(action.id) ?? false;
        const isClickable = typeof onSpellClick === "function";
        const isAddDisabled = isClickable && !isPrepared && isCapReached;
        const className = [
          "v2-spellbook-icon",
          isClickable ? "is-clickable" : "",
          isPrepared ? "is-prepared" : "",
          isAddDisabled ? "is-cap-reached" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const titleSuffix = isClickable
          ? isPrepared
            ? " — click to unprepare"
            : isAddDisabled
              ? " — prepared limit reached"
              : " — click to prepare"
          : "";

        const iconButton = (
          <button
            type="button"
            className={className}
            title={`${action.name} (${action.tier})${titleSuffix}`}
            draggable
            onDragStart={(event) => onDragStart(event, action)}
            onDragEnd={onDragEnd}
            onClick={
              isClickable
                ? () => {
                    if (isAddDisabled) {
                      return;
                    }
                    onSpellClick(action);
                  }
                : undefined
            }
          >
            {action.icon ? (
              <img src={action.icon} alt="" draggable={false} />
            ) : (
              <span className="v2-spellbook-icon-text">
                {action.fallbackIconText ?? action.short}
              </span>
            )}
          </button>
        );

        return (
          <SpellHoverPopup
            key={action.id}
            spell={action}
            positionPreference="vertical"
          >
            {iconButton}
          </SpellHoverPopup>
        );
      });
    },
    [onDragStart, onDragEnd],
  );

  const renderMetamagicSpellbookIcons = useCallback((options) => {
    if (!options.length) {
      return (
        <span className="v2-spellbook-row-empty">
          No metamagic available.
        </span>
      );
    }

    return options.map((option) => (
      <MetamagicHoverPopup
        key={option.id}
        metamagic={option}
        positionPreference="vertical"
      >
        <button
          type="button"
          className="v2-spellbook-icon v2-spellbook-icon-metamagic"
          title={option.name}
          aria-label={option.name}
        >
          <img src={option.icon} alt="" draggable={false} />
        </button>
      </MetamagicHoverPopup>
    ));
  }, []);

  return { renderSpellbookIcons, renderMetamagicSpellbookIcons };
};
