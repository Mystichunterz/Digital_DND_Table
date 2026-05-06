import { forwardRef } from "react";
import { formatSnapshotTimestamp } from "./utils";

const SnapshotMenu = forwardRef(
  (
    {
      isOpen,
      snapshots,
      snapshotError,
      onOpen,
      onClose,
      onLoad,
      onDelete,
    },
    rootRef,
  ) => (
    <div className="v2-moodboard-snapshot-menu" ref={rootRef}>
      <button
        type="button"
        className="v2-moodboard-action"
        onClick={isOpen ? onClose : onOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        Load…
      </button>
      {isOpen && (
        <div
          className="v2-moodboard-snapshot-list"
          role="listbox"
          aria-label="Past snapshots"
        >
          {snapshotError && (
            <p className="v2-moodboard-snapshot-error">{snapshotError}</p>
          )}
          {snapshots.length === 0 && !snapshotError && (
            <p className="v2-moodboard-snapshot-empty">
              No snapshots yet. Use <strong>Save Snapshot</strong> to create
              one.
            </p>
          )}
          {snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className="v2-moodboard-snapshot-row"
              role="option"
              aria-selected="false"
            >
              <button
                type="button"
                className="v2-moodboard-snapshot-load"
                onClick={() => onLoad(snapshot)}
              >
                <span className="v2-moodboard-snapshot-label">
                  {snapshot.label || "Untitled snapshot"}
                </span>
                <span className="v2-moodboard-snapshot-meta">
                  {formatSnapshotTimestamp(snapshot.createdAt)} ·{" "}
                  {snapshot.itemCount}{" "}
                  {snapshot.itemCount === 1 ? "item" : "items"}
                </span>
              </button>
              <button
                type="button"
                className="v2-moodboard-snapshot-delete"
                onClick={() => onDelete(snapshot)}
                aria-label={`Delete snapshot ${
                  snapshot.label || snapshot.id
                }`}
                title="Delete snapshot"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  ),
);

SnapshotMenu.displayName = "SnapshotMenu";

export default SnapshotMenu;
