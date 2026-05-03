import { useCallback, useEffect, useRef, useState } from "react";
import { useTrackHydration } from "../../../state/PersistenceStatusContext";

const PERSISTED_CHARACTER_ID = "default";
const PERSIST_DEBOUNCE_MS = 400;
const MAX_IMAGE_DIMENSION = 1024;

const STICKERS = [
  "⭐",
  "❤",
  "🔥",
  "⚔",
  "🛡",
  "📜",
  "✨",
  "💀",
  "👑",
  "🍷",
  "⚡",
  "🌟",
  "🌹",
  "🗡",
  "🏹",
  "🪶",
];

const DEFAULT_IMAGE_WIDTH = 200;
const DEFAULT_STICKER_SIZE = 56;
const MIN_IMAGE_WIDTH = 60;
const MAX_IMAGE_WIDTH = 600;
const MIN_STICKER_SIZE = 24;
const MAX_STICKER_SIZE = 220;

const createId = () =>
  `mb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const isEditableTarget = (target) => {
  if (!target) return false;
  const tag = target.tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  return Boolean(target.isContentEditable);
};

const getOutputMimeType = (originalType) => {
  if (originalType === "image/png") return "image/png";
  if (originalType === "image/webp") return "image/webp";
  return "image/jpeg";
};

const downscaleToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      try {
        URL.revokeObjectURL(objectUrl);
        const longest = Math.max(image.width, image.height);
        const scale =
          longest > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / longest : 1;
        const targetWidth = Math.max(1, Math.round(image.width * scale));
        const targetHeight = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas 2D context unavailable."));
          return;
        }
        context.drawImage(image, 0, 0, targetWidth, targetHeight);
        const mimeType = getOutputMimeType(file.type);
        const quality = mimeType === "image/jpeg" ? 0.85 : undefined;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve({
          dataUrl,
          naturalWidth: targetWidth,
          naturalHeight: targetHeight,
        });
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    image.src = objectUrl;
  });

const sanitizeItem = (raw, fallbackZ) => {
  if (!raw || typeof raw !== "object") return null;

  const baseProps = {
    id: typeof raw.id === "string" ? raw.id : createId(),
    x: Number.isFinite(raw.x) ? raw.x : 24,
    y: Number.isFinite(raw.y) ? raw.y : 24,
    rotation: Number.isFinite(raw.rotation) ? raw.rotation : 0,
    zIndex: Number.isFinite(raw.zIndex) ? raw.zIndex : fallbackZ,
  };

  if (raw.type === "image") {
    if (typeof raw.dataUrl !== "string" || !raw.dataUrl.startsWith("data:")) {
      return null;
    }
    const naturalWidth = Number.isFinite(raw.naturalWidth)
      ? raw.naturalWidth
      : 1;
    const naturalHeight = Number.isFinite(raw.naturalHeight)
      ? raw.naturalHeight
      : 1;
    return {
      ...baseProps,
      type: "image",
      dataUrl: raw.dataUrl,
      naturalWidth,
      naturalHeight,
      width: clamp(
        Number.isFinite(raw.width) ? raw.width : DEFAULT_IMAGE_WIDTH,
        MIN_IMAGE_WIDTH,
        MAX_IMAGE_WIDTH,
      ),
    };
  }

  if (raw.type === "sticker" && typeof raw.glyph === "string") {
    return {
      ...baseProps,
      type: "sticker",
      glyph: raw.glyph,
      size: clamp(
        Number.isFinite(raw.size) ? raw.size : DEFAULT_STICKER_SIZE,
        MIN_STICKER_SIZE,
        MAX_STICKER_SIZE,
      ),
    };
  }

  return null;
};

const getItemDimensions = (item) => {
  if (item.type === "sticker") {
    return { width: item.size, height: item.size };
  }
  const aspect = item.naturalHeight / Math.max(item.naturalWidth, 1);
  return { width: item.width, height: item.width * aspect };
};

const formatSnapshotTimestamp = (ms) => {
  try {
    return new Date(ms).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return new Date(ms).toISOString();
  }
};

const V2MoodboardPanel = () => {
  const [items, setItems] = useState([]);
  const [activeOp, setActiveOp] = useState(null);
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

  const handleItemPointerDown = (event, item) => {
    if (event.button !== 0 || event.target.closest("button")) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    bringToFront(item.id);

    setActiveOp({
      mode: "drag",
      id: item.id,
      pointerId: event.pointerId,
      offsetX: event.clientX - item.x,
      offsetY: event.clientY - item.y,
    });
  };

  const handleResizePointerDown = (event, item) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    bringToFront(item.id);

    const dims = getItemDimensions(item);
    const centerX = item.x + dims.width / 2;
    const centerY = item.y + dims.height / 2;
    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();
    const pointerInCanvasX = bounds ? event.clientX - bounds.left : event.clientX;
    const pointerInCanvasY = bounds ? event.clientY - bounds.top : event.clientY;
    const startDistance = Math.hypot(
      pointerInCanvasX - centerX,
      pointerInCanvasY - centerY,
    );

    setActiveOp({
      mode: "resize",
      id: item.id,
      pointerId: event.pointerId,
      startWidth: item.type === "image" ? item.width : item.size,
      startDistance: Math.max(startDistance, 1),
      itemType: item.type,
    });
  };

  const handleRotatePointerDown = (event, item) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    bringToFront(item.id);

    const dims = getItemDimensions(item);
    const centerX = item.x + dims.width / 2;
    const centerY = item.y + dims.height / 2;
    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();
    const pointerInCanvasX = bounds ? event.clientX - bounds.left : event.clientX;
    const pointerInCanvasY = bounds ? event.clientY - bounds.top : event.clientY;
    const startAngle = Math.atan2(
      pointerInCanvasY - centerY,
      pointerInCanvasX - centerX,
    );

    setActiveOp({
      mode: "rotate",
      id: item.id,
      pointerId: event.pointerId,
      centerX,
      centerY,
      startAngle,
      startRotation: item.rotation,
    });
  };

  const handlePointerMove = (event) => {
    if (!activeOp || event.pointerId !== activeOp.pointerId) return;

    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();

    if (activeOp.mode === "drag") {
      const nextX = event.clientX - activeOp.offsetX;
      const nextY = event.clientY - activeOp.offsetY;
      setItems((current) =>
        current.map((item) => {
          if (item.id !== activeOp.id) return item;
          const dims = getItemDimensions(item);
          if (!bounds) return { ...item, x: nextX, y: nextY };
          const minX = -dims.width / 2;
          const minY = -dims.height / 2;
          const maxX = bounds.width - dims.width / 2;
          const maxY = bounds.height - dims.height / 2;
          return {
            ...item,
            x: clamp(nextX, minX, maxX),
            y: clamp(nextY, minY, maxY),
          };
        }),
      );
      return;
    }

    if (activeOp.mode === "resize") {
      const pointerInCanvasX = bounds ? event.clientX - bounds.left : event.clientX;
      const pointerInCanvasY = bounds ? event.clientY - bounds.top : event.clientY;
      setItems((current) =>
        current.map((item) => {
          if (item.id !== activeOp.id) return item;
          const dims = getItemDimensions(item);
          const centerX = item.x + dims.width / 2;
          const centerY = item.y + dims.height / 2;
          const distance = Math.hypot(
            pointerInCanvasX - centerX,
            pointerInCanvasY - centerY,
          );
          const ratio = distance / activeOp.startDistance;
          const target = activeOp.startWidth * ratio;

          if (item.type === "image") {
            return {
              ...item,
              width: clamp(target, MIN_IMAGE_WIDTH, MAX_IMAGE_WIDTH),
            };
          }
          return {
            ...item,
            size: clamp(target, MIN_STICKER_SIZE, MAX_STICKER_SIZE),
          };
        }),
      );
      return;
    }

    if (activeOp.mode === "rotate") {
      const pointerInCanvasX = bounds ? event.clientX - bounds.left : event.clientX;
      const pointerInCanvasY = bounds ? event.clientY - bounds.top : event.clientY;
      const angle = Math.atan2(
        pointerInCanvasY - activeOp.centerY,
        pointerInCanvasX - activeOp.centerX,
      );
      const deltaDeg = ((angle - activeOp.startAngle) * 180) / Math.PI;
      const nextRotation = activeOp.startRotation + deltaDeg;
      const snapped = event.shiftKey
        ? Math.round(nextRotation / 15) * 15
        : nextRotation;

      setItems((current) =>
        current.map((item) =>
          item.id === activeOp.id ? { ...item, rotation: snapped } : item,
        ),
      );
    }
  };

  const handlePointerUp = (event) => {
    if (!activeOp || event.pointerId !== activeOp.pointerId) return;
    setActiveOp(null);
  };

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
      const response = await fetch(
        `/api/state/${PERSISTED_CHARACTER_ID}/moodboard/snapshots`,
      );
      if (!response.ok) {
        setSnapshotError(`Could not load snapshots (${response.status}).`);
        return;
      }
      const payload = await response.json();
      setSnapshots(Array.isArray(payload?.snapshots) ? payload.snapshots : []);
      setSnapshotError("");
    } catch (error) {
      setSnapshotError(
        error instanceof Error
          ? `Could not load snapshots: ${error.message}`
          : "Could not load snapshots.",
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
      await fetch(`/api/state/${PERSISTED_CHARACTER_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moodboard: { items: snapshot } }),
      });
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
      const response = await fetch(
        `/api/state/${PERSISTED_CHARACTER_ID}/moodboard/snapshots`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label }),
        },
      );
      if (!response.ok) {
        let message = `Snapshot failed (${response.status}).`;
        try {
          const payload = await response.json();
          if (payload?.message) message = payload.message;
        } catch {
          // keep status-only message
        }
        setSnapshotError(message);
        return;
      }
      await fetchSnapshots();
      setIsSnapshotMenuOpen(true);
    } catch (error) {
      setSnapshotError(
        error instanceof Error
          ? `Snapshot failed: ${error.message}`
          : "Snapshot failed.",
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
      const response = await fetch(
        `/api/state/${PERSISTED_CHARACTER_ID}/moodboard/snapshots/${snapshot.id}`,
      );
      if (!response.ok) {
        setSnapshotError(`Could not load snapshot (${response.status}).`);
        return;
      }
      const payload = await response.json();
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
        error instanceof Error
          ? `Could not load snapshot: ${error.message}`
          : "Could not load snapshot.",
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
      const response = await fetch(
        `/api/state/${PERSISTED_CHARACTER_ID}/moodboard/snapshots/${snapshot.id}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        setSnapshotError(`Could not delete snapshot (${response.status}).`);
        return;
      }
      await fetchSnapshots();
    } catch (error) {
      setSnapshotError(
        error instanceof Error
          ? `Could not delete snapshot: ${error.message}`
          : "Could not delete snapshot.",
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

  const renderControls = (item) => (
    <div className="v2-moodboard-item-controls">
      <button
        type="button"
        className="v2-moodboard-rotate-handle"
        title="Drag to rotate (hold Shift to snap)"
        aria-label="Rotate"
        onPointerDown={(event) => handleRotatePointerDown(event, item)}
      >
        ↻
      </button>
      <button
        type="button"
        className="is-danger"
        onClick={() => removeItem(item.id)}
        aria-label="Remove"
      >
        ×
      </button>
    </div>
  );

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
          <div className="v2-moodboard-snapshot-menu" ref={snapshotMenuRef}>
            <button
              type="button"
              className="v2-moodboard-action"
              onClick={
                isSnapshotMenuOpen ? closeSnapshotMenu : openSnapshotMenu
              }
              aria-haspopup="listbox"
              aria-expanded={isSnapshotMenuOpen}
            >
              Load…
            </button>
            {isSnapshotMenuOpen && (
              <div
                className="v2-moodboard-snapshot-list"
                role="listbox"
                aria-label="Past snapshots"
              >
                {snapshotError && (
                  <p className="v2-moodboard-snapshot-error">
                    {snapshotError}
                  </p>
                )}
                {snapshots.length === 0 && !snapshotError && (
                  <p className="v2-moodboard-snapshot-empty">
                    No snapshots yet. Use <strong>Save Snapshot</strong> to
                    create one.
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
                      onClick={() => loadSnapshot(snapshot)}
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
                      onClick={() => deleteSnapshot(snapshot)}
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

      <div className="v2-moodboard-stickers" aria-label="Sticker palette">
        {STICKERS.map((glyph) => (
          <button
            key={glyph}
            type="button"
            className="v2-moodboard-sticker-pick"
            onClick={() => addSticker(glyph)}
            aria-label={`Add ${glyph} sticker`}
          >
            <span aria-hidden="true">{glyph}</span>
          </button>
        ))}
      </div>

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

        {items.map((item) => {
          const dims = getItemDimensions(item);
          const isActive = activeOp?.id === item.id;
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
                key={item.id}
                className={
                  isActive
                    ? "v2-moodboard-item v2-moodboard-image is-active"
                    : "v2-moodboard-item v2-moodboard-image"
                }
                style={baseStyle}
                onPointerDown={(event) => handleItemPointerDown(event, item)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <img
                  src={item.dataUrl}
                  alt=""
                  draggable={false}
                  onLoad={() => handleImageSettled(item.id)}
                  onError={() => handleImageSettled(item.id)}
                />
                {renderControls(item)}
                <button
                  type="button"
                  className="v2-moodboard-resize-handle"
                  title="Drag to resize"
                  aria-label="Resize"
                  onPointerDown={(event) =>
                    handleResizePointerDown(event, item)
                  }
                />
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className={
                isActive
                  ? "v2-moodboard-item v2-moodboard-sticker is-active"
                  : "v2-moodboard-item v2-moodboard-sticker"
              }
              style={{
                ...baseStyle,
                fontSize: `${item.size * 0.72}px`,
              }}
              onPointerDown={(event) => handleItemPointerDown(event, item)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <span aria-hidden="true">{item.glyph}</span>
              {renderControls(item)}
              <button
                type="button"
                className="v2-moodboard-resize-handle"
                title="Drag to resize"
                aria-label="Resize"
                onPointerDown={(event) => handleResizePointerDown(event, item)}
              />
            </div>
          );
        })}
      </div>
    </article>
  );
};

export default V2MoodboardPanel;
