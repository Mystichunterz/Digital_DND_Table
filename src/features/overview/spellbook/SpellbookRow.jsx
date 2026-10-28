import { SECTION_GLYPHS } from "@/data/character/spellbookTabs";
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
    return <span className="spellbook-glyph-dot" aria-hidden="true" />;
  }
  if (config.kind === "infinity") {
    return (
      <span className="spellbook-glyph-text" aria-hidden="true">
        ∞
      </span>
    );
  }
  if (config.kind === "drop") {
    return (
      <span
        className="spellbook-glyph-text spellbook-glyph-drop"
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
  showLabel = false,
  framed = false,
  trailingEmptySlots = 0,
  slotsRemaining,
  slotsMax,
  children,
}) => {
  const className = [
    "spellbook-row",
    framed ? "spellbook-row-framed" : "",
    glyphKey ? `spellbook-row-${glyphKey}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const trailingSlots = [];
  for (let index = 0; index < trailingEmptySlots; index += 1) {
    trailingSlots.push(
      <span
        key={`empty-${index}`}
        className="spellbook-icon spellbook-icon-empty"
        aria-hidden="true"
      />,
    );
  }

  const isTierGlyph =
    typeof glyphKey === "string" && glyphKey.startsWith("tier-");
  const glyphClassName = isTierGlyph
    ? "spellbook-glyph spellbook-glyph-tier"
    : "spellbook-glyph";

  return (
    <section className={className} aria-label={label}>
      {showLabel && <span className="spellbook-row-title">{label}</span>}
      <span className={glyphClassName}>{renderGlyph(glyphKey, label)}</span>
      <div className="spellbook-icon-row">
        {children}
        {trailingSlots}
      </div>
      {slotsMax > 0 && (
        <SlotPipGrid remaining={slotsRemaining} max={slotsMax} label={label} />
      )}
    </section>
  );
};

export default SpellbookRow;
