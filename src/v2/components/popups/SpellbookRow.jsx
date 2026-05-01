import { SECTION_GLYPHS } from "../../data/spellbookTabs";
import SlotPipGrid from "./SlotPipGrid";

const renderGlyph = (glyphKey, label) => {
  const config = SECTION_GLYPHS[glyphKey];

  if (!config) {
    return null;
  }

  if (config.kind === "image") {
    return <img src={config.src} alt={label ?? ""} draggable={false} />;
  }
  if (config.kind === "dot") {
    return <span className="v2-spellbook-glyph-dot" aria-hidden="true" />;
  }
  if (config.kind === "infinity") {
    return (
      <span className="v2-spellbook-glyph-text" aria-hidden="true">
        ∞
      </span>
    );
  }
  if (config.kind === "drop") {
    return (
      <span
        className="v2-spellbook-glyph-text v2-spellbook-glyph-drop"
        aria-hidden="true"
      >
        ◆
      </span>
    );
  }
  return null;
};

const SpellbookRow = ({
  glyphKey,
  label,
  framed = false,
  trailingEmptySlots = 0,
  slotsRemaining,
  slotsMax,
  children,
}) => {
  const className = framed
    ? "v2-spellbook-row v2-spellbook-row-framed"
    : "v2-spellbook-row";

  const trailingSlots = [];
  for (let index = 0; index < trailingEmptySlots; index += 1) {
    trailingSlots.push(
      <span
        key={`empty-${index}`}
        className="v2-spellbook-icon v2-spellbook-icon-empty"
        aria-hidden="true"
      />,
    );
  }

  return (
    <section className={className} aria-label={label}>
      <span className="v2-spellbook-glyph">
        {renderGlyph(glyphKey, label)}
      </span>
      <div className="v2-spellbook-icon-row">
        {children}
        {trailingSlots}
      </div>
      {slotsMax > 0 && (
        <SlotPipGrid
          remaining={slotsRemaining}
          max={slotsMax}
          label={label}
        />
      )}
    </section>
  );
};

export default SpellbookRow;
