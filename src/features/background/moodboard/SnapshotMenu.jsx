import { forwardRef } from "react";
import { formatSnapshotTimestamp } from "./utils";

const SnapshotMenu = forwardRef(
  (
    { isOpen, snapshots, snapshotError, onOpen, onClose, onLoad, onDelete },
    rootRef,
  ) => (
    <div className="moodboard-snapshot-menu" ref={rootRef}>
      <button
        type="button"
        className="moodboard-action"
        onClick={isOpen ? onClose : onOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        Load…
      </button>
      {isOpen && (
        <div
          className="moodboard-snapshot-list"
          role="listbox"
          aria-label="Past snapshots"
        >
          {snapshotError && (
            <p className="moodboard-snapshot-error">{snapshotError}</p>
          )}
          {snapshots.length === 0 && !snapshotError && (
            <p className="moodboard-snapshot-empty">
              No snapshots yet. Use <strong>Save Snapshot</strong> to create
              one.
            </p>
          )}
          {snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className="moodboard-snapshot-row"
              role="option"
              aria-selected="false"
            >
              <button
                type="button"
                className="moodboard-snapshot-load"
                onClick={() => onLoad(snapshot)}
              >
                <span className="moodboard-snapshot-label">
                  {snapshot.label || "Untitled snapshot"}
                </span>
                <span className="moodboard-snapshot-meta">
                  {formatSnapshotTimestamp(snapshot.createdAt)} ·{" "}
                  {snapshot.itemCount}{" "}
                  {snapshot.itemCount === 1 ? "item" : "items"}
                </span>
              </button>
              <button
                type="button"
                className="moodboard-snapshot-delete"
                onClick={() => onDelete(snapshot)}
                aria-label={`Delete snapshot ${snapshot.label || snapshot.id}`}
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
