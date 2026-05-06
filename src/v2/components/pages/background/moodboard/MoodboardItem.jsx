import { getItemDimensions } from "./items";

const ItemControls = ({ item, onRotateStart, onRemove }) => (
  <div className="v2-moodboard-item-controls">
    <button
      type="button"
      className="v2-moodboard-rotate-handle"
      title="Drag to rotate (hold Shift to snap)"
      aria-label="Rotate"
      onPointerDown={(event) => onRotateStart(event, item)}
    >
      ↻
    </button>
    <button
      type="button"
      className="is-danger"
      onClick={() => onRemove(item.id)}
      aria-label="Remove"
    >
      ×
    </button>
  </div>
);

const MoodboardItem = ({
  item,
  isActive,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onResizeStart,
  onRotateStart,
  onRemove,
  onImageSettled,
}) => {
  const dims = getItemDimensions(item);
  const baseStyle = {
    left: `${item.x}px`,
    top: `${item.y}px`,
    width: `${dims.width}px`,
    height: `${dims.height}px`,
    zIndex: item.zIndex,
    transform: `rotate(${item.rotation}deg)`,
  };

  if (item.type === "image") {
    return (
      <div
        className={
          isActive
            ? "v2-moodboard-item v2-moodboard-image is-active"
            : "v2-moodboard-item v2-moodboard-image"
        }
        style={baseStyle}
        onPointerDown={(event) => onPointerDown(event, item)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          src={item.dataUrl}
          alt=""
          draggable={false}
          onLoad={() => onImageSettled(item.id)}
          onError={() => onImageSettled(item.id)}
        />
        <ItemControls
          item={item}
          onRotateStart={onRotateStart}
          onRemove={onRemove}
        />
        <button
          type="button"
          className="v2-moodboard-resize-handle"
          title="Drag to resize"
          aria-label="Resize"
          onPointerDown={(event) => onResizeStart(event, item)}
        />
      </div>
    );
  }

  return (
    <div
      className={
        isActive
          ? "v2-moodboard-item v2-moodboard-sticker is-active"
          : "v2-moodboard-item v2-moodboard-sticker"
      }
      style={{
        ...baseStyle,
        fontSize: `${item.size * 0.72}px`,
      }}
      onPointerDown={(event) => onPointerDown(event, item)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <span aria-hidden="true">{item.glyph}</span>
      <ItemControls
        item={item}
        onRotateStart={onRotateStart}
        onRemove={onRemove}
      />
      <button
        type="button"
        className="v2-moodboard-resize-handle"
        title="Drag to resize"
        aria-label="Resize"
        onPointerDown={(event) => onResizeStart(event, item)}
      />
    </div>
  );
};

export default MoodboardItem;
