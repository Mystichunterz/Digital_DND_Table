import { useCallback, useEffect, useRef, useState } from "react";
import { useTrackHydration } from "../../../state/PersistenceStatusContext";
import {
  DEFAULT_IMAGE_WIDTH,
  DEFAULT_STICKER_SIZE,
  PERSIST_DEBOUNCE_MS,
} from "./moodboard/constants";
import { downscaleToDataUrl } from "./moodboard/imageProcessing";
import { createId, sanitizeItem } from "./moodboard/items";
import {
  formatSnapshotTimestamp,
  isEditableTarget,
} from "./moodboard/utils";
import StickerPalette from "./moodboard/StickerPalette";
import SnapshotMenu from "./moodboard/SnapshotMenu";
import MoodboardItem from "./moodboard/MoodboardItem";
import { useMoodboardPointerOps } from "./moodboard/useMoodboardPointerOps";
import {
  createMoodboardSnapshot,
  deleteMoodboardSnapshot,
  getMoodboardSnapshot,
  listMoodboardSnapshots,
  patchMoodboardItems,
} from "./moodboard/api";

const PERSISTED_CHARACTER_ID = "default";

const V2MoodboardPanel = () => {
  const [items, setItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ kind: "idle", message: "" });
  const [snapshots, setSnapshots] = useState([]);
  const [isSnapshotMenuOpen, setIsSnapshotMenuOpen] = useState(false);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState(false);
  const [bulkPendingIds, setBulkPendingIds] = useState(() => new Set());
  const [snapshotError, setSnapshotError] = useState("");
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const snapshotMenuRef = useRef(null);
  const nextZIndexRef = useRef(1);
  const pendingItemsRef = useRef(null);

  // Hydrate from server.
  useEffect(() => {
    let isCancelled = false;

    const hydrate = async () => {
      try {
        const response = await fetch(`/api/state/${PERSISTED_CHARACTER_ID}`);

        if (isCancelled || !response.ok) {
          return;
        }

        const saved = await response.json();
        if (
          isCancelled ||
          !saved ||
          typeof saved !== "object" ||
          !saved.moodboard ||
          typeof saved.moodboard !== "object"
        ) {
          return;
        }

        const rawItems = Array.isArray(saved.moodboard.items)
          ? saved.moodboard.items
          : [];
        const sanitized = rawItems
          .map((raw, index) => sanitizeItem(raw, index + 1))
          .filter(Boolean);

        if (sanitized.length > 0) {
          const maxZ = sanitized.reduce(
            (acc, item) => Math.max(acc, item.zIndex ?? 0),
            0,
          );
          nextZIndexRef.current = Math.max(maxZ, sanitized.length);
        }

        setBulkPendingIds(
          new Set(
            sanitized.filter((item) => item.type === "image").map((item) => item.id),
          ),
        );
        setItems(sanitized);
      } catch {
        // Server unavailable — keep empty state.
      } finally {
        if (!isCancelled) {
          setIsHydrated(true);
        }
      }
    };

    hydrate();

    return () => {
      isCancelled = true;
    };
  }, []);

  useTrackHydration(isHydrated);

  // Persist (debounced) with surfaced error state.
  useEffect(() => {
    if (!isHydrated) {
      return undefined;
    }

    pendingItemsRef.current = items;
    setSaveStatus((current) =>
      current.kind === "error" ? current : { kind: "pending", message: "" },
    );

    const timeoutId = setTimeout(async () => {
      const snapshot = pendingItemsRef.current;
      pendingItemsRef.current = null;
      const body = JSON.stringify({ moodboard: { items: snapshot } });
      const sizeMb = (body.length / (1024 * 1024)).toFixed(2);
      setSaveStatus({ kind: "saving", message: `${sizeMb} MB` });

      try {
        const response = await fetch(
          `/api/state/${PERSISTED_CHARACTER_ID}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body,
          },
        );

        if (!response.ok) {
          let serverMessage = "";
          try {
            const payload = await response.clone().json();
            if (payload && typeof payload.message === "string") {
              serverMessage = payload.message;
            }
          } catch {
            // Non-JSON error body — fall back to status text.
          }

          const isPayloadTooLarge =
            response.status === 413 ||
            /too large|entity too large|payloadtoolarge/i.test(serverMessage);

          const message = isPayloadTooLarge
            ? `Save failed (${response.status}): ${sizeMb} MB body exceeds the running API server's limit. Stop the dev:api process (Ctrl+C in its terminal) and restart it with \`npm run dev:api\` — file edits don't take effect until restart.`
            : `Save failed (${response.status}${serverMessage ? ` — ${serverMessage}` : ""}; ${sizeMb} MB)`;

          setSaveStatus({ kind: "error", message });
          return;
        }

        setSaveStatus({ kind: "saved", message: `${sizeMb} MB` });
      } catch (error) {
        setSaveStatus({
          kind: "error",
          message:
            error instanceof Error
              ? `Save failed: ${error.message}`
              : "Save failed: network error.",
        });
      }
    }, PERSIST_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isHydrated, items]);

  // Best-effort flush before the page unloads / hides.
  useEffect(() => {
    const flush = () => {
      const snapshot = pendingItemsRef.current;
      if (!snapshot) return;
      pendingItemsRef.current = null;
      try {
        fetch(`/api/state/${PERSISTED_CHARACTER_ID}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moodboard: { items: snapshot } }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // keepalive bodies > ~64 KB are rejected; nothing more we can do.
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", handleVisibility);
      // Tab navigation within the SPA unmounts this component without
      // firing pagehide, so flush any pending body here too.
      flush();
    };
  }, []);

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

  // ---------- Pointer ops ----------

  // ---------- Drop / paste ----------

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

  // ---------- Snapshots ----------

  const fetchSnapshots = useCallback(async () => {
    try {
      const list = await listMoodboardSnapshots(PERSISTED_CHARACTER_ID);
      setSnapshots(list);
      setSnapshotError("");
    } catch (error) {
      setSnapshotError(
        error instanceof Error ? error.message : "Could not load snapshots.",
      );
    }
  }, []);

  const openSnapshotMenu = () => {
    setIsSnapshotMenuOpen(true);
    fetchSnapshots();
  };

  const closeSnapshotMenu = useCallback(() => {
    setIsSnapshotMenuOpen(false);
  }, []);

  // Close snapshot menu on outside click / Escape.
  useEffect(() => {
    if (!isSnapshotMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!snapshotMenuRef.current?.contains(event.target)) {
        closeSnapshotMenu();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeSnapshotMenu();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSnapshotMenuOpen, closeSnapshotMenu]);

  const flushPendingSave = useCallback(async () => {
    const snapshot = pendingItemsRef.current;
    if (!snapshot) return;
    pendingItemsRef.current = null;
    try {
      await patchMoodboardItems(PERSISTED_CHARACTER_ID, snapshot);
    } catch {
      // Surfaced by the regular debounced save effect.
    }
  }, []);

  const createSnapshot = async () => {
    if (isCreatingSnapshot) return;
    setIsCreatingSnapshot(true);
    setSnapshotError("");

    // Make sure the snapshot reflects what's currently on the board.
    await flushPendingSave();

    const label = window.prompt(
      "Label this snapshot (optional):",
      `Snapshot ${formatSnapshotTimestamp(Date.now())}`,
    );

    // User cancelled.
    if (label === null) {
      setIsCreatingSnapshot(false);
      return;
    }

    try {
      await createMoodboardSnapshot(PERSISTED_CHARACTER_ID, label);
      await fetchSnapshots();
      setIsSnapshotMenuOpen(true);
    } catch (error) {
      setSnapshotError(
        error instanceof Error ? error.message : "Snapshot failed.",
      );
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  const loadSnapshot = async (snapshot) => {
    const labelText = snapshot.label
      ? `"${snapshot.label}"`
      : `from ${formatSnapshotTimestamp(snapshot.createdAt)}`;
    const confirmed = window.confirm(
      `Replace the current board with snapshot ${labelText}?\n\nThe current board will be auto-saved over and replaced. Take a snapshot first if you want to keep it.`,
    );
    if (!confirmed) return;

    setIsLoadingSnapshot(true);
    try {
      const payload = await getMoodboardSnapshot(
        PERSISTED_CHARACTER_ID,
        snapshot.id,
      );
      const rawItems = Array.isArray(payload?.moodboard?.items)
        ? payload.moodboard.items
        : [];
      const sanitized = rawItems
        .map((raw, index) => sanitizeItem(raw, index + 1))
        .filter(Boolean);

      const maxZ = sanitized.reduce(
        (acc, item) => Math.max(acc, item.zIndex ?? 0),
        0,
      );
      nextZIndexRef.current = Math.max(maxZ, sanitized.length, 1);

      setBulkPendingIds(
        new Set(
          sanitized.filter((item) => item.type === "image").map((item) => item.id),
        ),
      );
      setItems(sanitized);
      setIsSnapshotMenuOpen(false);
      setSnapshotError("");
    } catch (error) {
      setSnapshotError(
        error instanceof Error ? error.message : "Could not load snapshot.",
      );
    } finally {
      setIsLoadingSnapshot(false);
    }
  };

  const deleteSnapshot = async (snapshot) => {
    const labelText = snapshot.label
      ? `"${snapshot.label}"`
      : `from ${formatSnapshotTimestamp(snapshot.createdAt)}`;
    const confirmed = window.confirm(
      `Permanently delete snapshot ${labelText}?`,
    );
    if (!confirmed) return;

    try {
      await deleteMoodboardSnapshot(PERSISTED_CHARACTER_ID, snapshot.id);
      await fetchSnapshots();
    } catch (error) {
      setSnapshotError(
        error instanceof Error ? error.message : "Could not delete snapshot.",
      );
    }
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
