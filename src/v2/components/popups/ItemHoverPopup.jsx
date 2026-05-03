import Popup from "./Popup";
import AcIcon from "../../../assets/layout/left_display/AC_Icon.png";
import "../../styles/components/popups/item-hover-popup.scss";

const RARITY_LABEL = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  veryRare: "Very Rare",
  legendary: "Legendary",
};

const RARITY_CLASS = {
  common: "is-rarity-common",
  uncommon: "is-rarity-uncommon",
  rare: "is-rarity-rare",
  veryRare: "is-rarity-very-rare",
  legendary: "is-rarity-legendary",
};

const buildSubtitle = (item) => {
  if (item.subtitle) return item.subtitle;

  const rarityLabel = RARITY_LABEL[item.rarity] ?? "";
  const typeLabel = item.category ?? "Item";
  return `${rarityLabel} ${typeLabel}`.trim();
};

const ItemHoverPopup = ({
  item,
  equippedBy,
  triggerRef,
  onPinChange,
  positionPreference = "horizontal",
}) => {
  const subtitle = buildSubtitle(item);
  const rarityClass = RARITY_CLASS[item.rarity] ?? "";
  const hero = item.hero ?? null;
  const properties = Array.isArray(item.properties) ? item.properties : [];
  const notes = Array.isArray(item.notes) ? item.notes : [];

  const showFooterMeta =
    item.weight !== undefined || item.value !== undefined;
  const showFooterTags = item.actionType || item.useType;

  return (
    <Popup
      triggerRef={triggerRef}
      positionPreference={positionPreference}
      onPinChange={onPinChange}
    >
      <div className={`item-hover-popup ${rarityClass}`.trim()}>
        {item.icon && (
          <div className="item-hover-popup-art" aria-hidden="true">
            <img src={item.icon} alt="" draggable={false} />
          </div>
        )}

        <header
          className={
            item.icon
              ? "item-hover-popup-header has-art"
              : "item-hover-popup-header"
          }
        >
          <h5 className="item-hover-popup-title">{item.name}</h5>
          <p className="item-hover-popup-subtitle">{subtitle}</p>
          {equippedBy && (
            <p className="item-hover-popup-equipped">
              <span className="item-hover-popup-equipped-bullet" aria-hidden="true" />
              Equipped by {equippedBy}
            </p>
          )}
        </header>

        {hero?.kind === "ac" && (
          <div className="item-hover-popup-hero is-ac">
            <div className="item-hover-popup-ac-shield" aria-hidden="true">
              <img src={AcIcon} alt="" draggable={false} />
              <span className="item-hover-popup-ac-value">{hero.value}</span>
            </div>
            <span className="item-hover-popup-ac-label">Armour Class</span>
          </div>
        )}

        {hero?.kind === "effect" && (
          <div className="item-hover-popup-hero is-effect">
            {hero.headline && (
              <p className="item-hover-popup-effect-headline">
                {hero.headline}
              </p>
            )}
            {hero.formula && (
              <p className="item-hover-popup-effect-formula">{hero.formula}</p>
            )}
          </div>
        )}

        {properties.length > 0 && (
          <ul className="item-hover-popup-properties">
            {properties.map((prop, index) => (
              <li
                key={`${prop.title}-${index}`}
                className="item-hover-popup-property"
              >
                <strong>{prop.title}:</strong> {prop.text}
              </li>
            ))}
          </ul>
        )}

        {item.flavor && (
          <p className="item-hover-popup-flavor">
            <span className="item-hover-popup-flavor-mark" aria-hidden="true">
              ❧
            </span>
            {item.flavor}
          </p>
        )}

        {notes.length > 0 && (
          <ul className="item-hover-popup-notes">
            {notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        )}

        {(showFooterTags || showFooterMeta) && (
          <footer className="item-hover-popup-footer">
            {showFooterTags && (
              <div className="item-hover-popup-footer-tags">
                {item.actionType && (
                  <span className="item-hover-popup-tag is-action">
                    {item.actionType}
                  </span>
                )}
                {item.useType && (
                  <span className="item-hover-popup-tag">{item.useType}</span>
                )}
              </div>
            )}
            {showFooterMeta && (
              <div className="item-hover-popup-footer-meta">
                {item.weight !== undefined && (
                  <span title="Weight (lb)">{item.weight} lb</span>
                )}
                {item.value !== undefined && (
                  <span title="Value (gp)">{item.value} gp</span>
                )}
              </div>
            )}
          </footer>
        )}
      </div>
    </Popup>
  );
};

export default ItemHoverPopup;
