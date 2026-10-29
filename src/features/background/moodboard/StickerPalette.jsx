import { STICKERS } from "./constants";

const StickerPalette = ({ onPick }) => (
  <div className="moodboard-stickers" aria-label="Sticker palette">
    {STICKERS.map((glyph) => (
      <button
        key={glyph}
        type="button"
        className="moodboard-sticker-pick"
        onClick={() => onPick(glyph)}
        aria-label={`Add ${glyph} sticker`}
      >
        <span aria-hidden="true">{glyph}</span>
      </button>
    ))}
  </div>
);

export default StickerPalette;
