import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_IMAGE_WIDTH,
  DEFAULT_STICKER_SIZE,
} from "./moodboard/constants";
import { downscaleToDataUrl } from "./moodboard/imageProcessing";
import { createId, sanitizeItem } from "./moodboard/items";
import { isEditableTarget } from "./moodboard/utils";
import StickerPalette from "./moodboard/StickerPalette";
import SnapshotMenu from "./moodboard/SnapshotMenu";
import MoodboardItem from "./moodboard/MoodboardItem";
import { useMoodboardPointerOps } from "./moodboard/useMoodboardPointerOps";
import { useMoodboardPersistence } from "./moodboard/useMoodboardPersistence";
import { useMoodboardSnapshots } from "./moodboard/useMoodboardSnapshots";

const PERSISTED_CHARACTER_ID = "default";

const sanitizeMoodboardItems = (raw) => {
  const rawItems = Array.isArray(raw?.items) ? raw.items : [];
  return rawItems
    .map((item, index) => sanitizeItem(item, index + 1))
    .filter(Boolean);
};

const V2MoodboardPanel = () => {
  const [items, setItems] = useState([]);
  const [bulkPendingIds, setBulkPendingIds] = useState(() => new Set());
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const nextZIndexRef = useRef(1);

  const applyMoodboardItems = useCallback((raw) => {
    const sanitized = sanitizeMoodboardItems(raw);

    const maxZ = sanitized.reduce(
      (acc, item) => Math.max(acc, item.zIndex ?? 0),
      0,
    );
    nextZIndexRef.current = Math.max(maxZ, sanitized.length, 1);

    setBulkPendingIds(
      new Set(
        sanitized
          .filter((item) => item.type === "image")
          .map((item) => item.id),
      ),
    );
    setItems(sanitized);
  }, []);

  const { isHydrated, saveStatus, flushPendingSave } = useMoodboardPersistence({
    characterId: PERSISTED_CHARACTER_ID,
    items,
    onHydrate: applyMoodboardItems,
  });

  const {
    snapshots,
    snapshotMenuRef,
    isSnapshotMenuOpen,
    isCreatingSnapshot,
    isLoadingSnapshot,
    snapshotError,
    openSnapshotMenu,
    closeSnapshotMenu,
    createSnapshot,
    loadSnapshot,
    deleteSnapshot,
  } = useMoodboardSnapshots({
    characterId: PERSISTED_CHARACTER_ID,
    flushPendingSave,
    onLoadSnapshot: (payload) => applyMoodboardItems(payload?.moodboard),
  });

  const bringToFront = useCallback((id) => {
    setItems((current) => {
      const next = [...current];
      const index = next.findIndex((item) => item.id === id);
      if (index === -1) return current;

      nextZIndexRef.current += 1;
      next[index] = { ...next[index], zIndex: nextZIndexRef.current };
      return next;
    });
  }, []);

  const {
    activeOp,
    handleItemPointerDown,
    handleResizePointerDown,
    handleRotatePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useMoodboardPointerOps({
    items,
    setItems,
    canvasRef,
    bringToFront,
  });

  const addImageItems = useCallback(async (files) => {
    if (!files.length) return;

    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();
    const baseLeft = bounds ? bounds.width / 2 - DEFAULT_IMAGE_WIDTH / 2 : 24;
    const baseTop = bounds ? bounds.height / 2 - DEFAULT_IMAGE_WIDTH / 2 : 24;

    const settled = await Promise.allSettled(
      files.map((file) => downscaleToDataUrl(file)),
    );

    const newItems = [];
    settled.forEach((result, index) => {
      if (result.status !== "fulfilled") return;

      nextZIndexRef.current += 1;
      newItems.push({
        id: createId(),
        type: "image",
        dataUrl: result.value.dataUrl,
        naturalWidth: result.value.naturalWidth,
        naturalHeight: result.value.naturalHeight,
        x: baseLeft + index * 24,
        y: baseTop + index * 24,
        width: DEFAULT_IMAGE_WIDTH,
        rotation: 0,
        zIndex: nextZIndexRef.current,
      });
    });

    if (newItems.length === 0) return;
    setItems((current) => [...current, ...newItems]);
  }, []);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files ?? []);
    addImageItems(files);
    event.target.value = "";
  };

  const addSticker = (glyph) => {
    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();
    const baseLeft = bounds
      ? Math.random() * Math.max(bounds.width - DEFAULT_STICKER_SIZE - 32, 32)
      : 32;
    const baseTop = bounds
      ? Math.random() * Math.max(bounds.height - DEFAULT_STICKER_SIZE - 32, 32)
      : 32;

    nextZIndexRef.current += 1;

    setItems((current) => [
      ...current,
      {
        id: createId(),
        type: "sticker",
        glyph,
        x: baseLeft,
        y: baseTop,
        size: DEFAULT_STICKER_SIZE,
        rotation: 0,
        zIndex: nextZIndexRef.current,
      },
    ]);
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const clearBoard = () => {
    setItems([]);
  };

  const handleCanvasDragOver = (event) => {
    if (Array.from(event.dataTransfer?.types ?? []).includes("Files")) {
      event.preventDefault();
    }
  };

  const handleCanvasDrop = (event) => {
    const files = Array.from(event.dataTransfer?.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (files.length === 0) return;

    event.preventDefault();
    addImageItems(files);
  };

  // Window-level paste listener.
  useEffect(() => {
    const handlePaste = (event) => {
      if (isEditableTarget(event.target)) return;

      const items = Array.from(event.clipboardData?.items ?? []);
      const imageFiles = items
        .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter(Boolean);

      if (imageFiles.length === 0) return;

      event.preventDefault();
      addImageItems(imageFiles);
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [addImageItems]);

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageSettled = useCallback((id) => {
    setBulkPendingIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isLoading = !isHydrated || isLoadingSnapshot || bulkPendingIds.size > 0;

  return (
    <article className="v2-overview-panel v2-background-panel v2-moodboard-panel">
      <header className="v2-overview-panel-header v2-moodboard-header">
        <h2>Moodboard</h2>
        <div className="v2-moodboard-toolbar">
          <span
            className={`v2-moodboard-status is-${saveStatus.kind}`}
            role="status"
            aria-live="polite"
            title={saveStatus.message}
          >
            {saveStatus.kind === "saving" && "Saving…"}
            {saveStatus.kind === "pending" && "Pending…"}
            {saveStatus.kind === "saved" && "Saved"}
            {saveStatus.kind === "error" && (saveStatus.message || "Save failed")}
            {saveStatus.kind === "idle" && ""}
          </span>
          <button
            type="button"
            className="v2-moodboard-action"
            onClick={triggerUpload}
          >
            Add Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="v2-moodboard-file-input"
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="v2-moodboard-action"
            onClick={createSnapshot}
            disabled={isCreatingSnapshot}
          >
            {isCreatingSnapshot ? "Saving…" : "Save Snapshot"}
          </button>
          <SnapshotMenu
            ref={snapshotMenuRef}
            isOpen={isSnapshotMenuOpen}
            snapshots={snapshots}
            snapshotError={snapshotError}
            onOpen={openSnapshotMenu}
            onClose={closeSnapshotMenu}
            onLoad={loadSnapshot}
            onDelete={deleteSnapshot}
          />
          <button
            type="button"
            className="v2-moodboard-action is-danger"
            onClick={clearBoard}
            disabled={items.length === 0}
          >
            Clear
          </button>
        </div>
      </header>

      <StickerPalette onPick={addSticker} />

      <div
        ref={canvasRef}
        className={
          activeOp
            ? `v2-moodboard-canvas is-${activeOp.mode}`
            : "v2-moodboard-canvas"
        }
        onDragOver={handleCanvasDragOver}
        onDrop={handleCanvasDrop}
      >
        {items.length === 0 && !isLoading && (
          <p className="v2-moodboard-empty">
            Drop images here, paste from clipboard, click <strong>Add Image</strong>,
            or pick a sticker above to start your board.
          </p>
        )}

        {isLoading && (
          <div
            className="v2-moodboard-loading"
            role="status"
            aria-live="polite"
          >
            <span className="v2-moodboard-spinner" aria-hidden="true" />
            <span className="v2-moodboard-loading-label">
              {isLoadingSnapshot ? "Loading snapshot…" : "Loading moodboard…"}
            </span>
          </div>
        )}

        {items.map((item) => (
          <MoodboardItem
            key={item.id}
            item={item}
            isActive={activeOp?.id === item.id}
            onPointerDown={handleItemPointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onResizeStart={handleResizePointerDown}
            onRotateStart={handleRotatePointerDown}
            onRemove={removeItem}
            onImageSettled={handleImageSettled}
          />
        ))}
      </div>
    </article>
  );
};

export default V2MoodboardPanel;
