import { Fragment } from "react";
import SpellHoverPopup from "../../../popups/SpellHoverPopup";
import { canAffordAction, isSpellAction } from "./resources";
import { isActionLockedForPreparation } from "./preparedSpells";

const LockOverlay = () => (
  <span className="v2-action-lock-overlay" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.25a4.75 4.75 0 0 0-4.75 4.75V10H6.5A2.25 2.25 0 0 0 4.25 12.25v7.5A2.25 2.25 0 0 0 6.5 22h11a2.25 2.25 0 0 0 2.25-2.25v-7.5A2.25 2.25 0 0 0 17.5 10h-.75V7A4.75 4.75 0 0 0 12 2.25Zm-3.25 4.75a3.25 3.25 0 1 1 6.5 0V10h-6.5V7Z" />
    </svg>
  </span>
);

export const EmptyActionTile = ({
  sectionId,
  index,
  isDropTarget,
  canDropInSection,
  onDragOver,
  onDrop,
}) => (
  <button
    type="button"
    className={
      isDropTarget
        ? "v2-action-tile v2-action-tile-empty is-drop-target"
        : "v2-action-tile v2-action-tile-empty"
    }
    aria-hidden="true"
    tabIndex={-1}
    onDragOver={(event) => {
      if (!canDropInSection) {
        return;
      }
      event.preventDefault();
      onDragOver(sectionId, index);
    }}
    onDrop={(event) => {
      if (!canDropInSection) {
        return;
      }
      event.preventDefault();
      onDrop(sectionId, index);
    }}
  />
);

export const ActionTile = ({
  item,
  sectionId,
  index,
  isDragging,
  isDropTarget,
  isGwmActive,
  preparedSpellIds,
  resources,
  canDropInSection,
  onActionClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}) => {
  const isLocked = isActionLockedForPreparation(item, preparedSpellIds);
  const isToggleActive = item.toggle === "gwm" && isGwmActive;
  const isUnaffordable = !isLocked && !canAffordAction(item, resources);
  const tileClassName = [
    "v2-action-tile",
    `tone-${item.tone}`,
    isDragging ? "is-dragging" : "",
    isDropTarget ? "is-drop-target" : "",
    isLocked ? "is-locked" : "",
    isUnaffordable ? "is-unaffordable" : "",
    isToggleActive ? "is-toggle-active" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const toggleSuffix = isToggleActive ? " — ON" : "";
  const tileTitle = isLocked
    ? `${item.name} (${item.kind}) — not prepared`
    : isUnaffordable
      ? `${item.name} (${item.kind}) — not enough resources`
      : `${item.name} (${item.kind})${toggleSuffix}`;

  const tileButton = (
    <button
      type="button"
      className={tileClassName}
      title={tileTitle}
      aria-label={tileTitle}
      aria-disabled={isLocked || undefined}
      draggable
      onClick={(event) => onActionClick(item, event)}
      onDragStart={(event) => onDragStart(event, item, sectionId, index)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        if (!canDropInSection) {
          return;
        }
        event.preventDefault();
        onDragOver(sectionId, index);
      }}
      onDrop={(event) => {
        if (!canDropInSection) {
          return;
        }
        event.preventDefault();
        onDrop(sectionId, index);
      }}
    >
      {item.icon ? (
        <img
          src={item.icon}
          alt=""
          className="v2-action-icon"
          draggable={false}
        />
      ) : (
        <span className="v2-action-short">
          {item.fallbackIconText ?? item.short}
        </span>
      )}
      {item.keybind && (
        <span className="v2-action-keybind">{item.keybind}</span>
      )}
      {item.kind === "bonus" && <span className="v2-action-plus">+</span>}
      {typeof item.quantity === "number" && (
        <span className="v2-action-qty">{item.quantity}</span>
      )}
      {isLocked && <LockOverlay />}
    </button>
  );

  const hasHoverPopup =
    isSpellAction(item) ||
    item.category === "common" ||
    item.category === "items";

  if (!hasHoverPopup) {
    return <Fragment key={item.id}>{tileButton}</Fragment>;
  }

  return (
    <SpellHoverPopup key={item.id} spell={item}>
      {tileButton}
    </SpellHoverPopup>
  );
};
