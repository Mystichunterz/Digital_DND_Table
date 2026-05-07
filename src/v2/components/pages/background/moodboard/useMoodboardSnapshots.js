import { useCallback, useEffect, useRef, useState } from "react";
import { formatSnapshotTimestamp } from "./utils";
import {
  createMoodboardSnapshot,
  deleteMoodboardSnapshot,
  getMoodboardSnapshot,
  listMoodboardSnapshots,
} from "./api";

export const useMoodboardSnapshots = ({
  characterId,
  flushPendingSave,
  onLoadSnapshot,
}) => {
  const [snapshots, setSnapshots] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef(null);

  const fetchSnapshots = useCallback(async () => {
    try {
      const list = await listMoodboardSnapshots(characterId);
      setSnapshots(list);
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not load snapshots.",
      );
    }
  }, [characterId]);

  const openMenu = () => {
    setIsMenuOpen(true);
    fetchSnapshots();
  };

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Close menu on outside click / Escape.
  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        closeMenu();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, closeMenu]);

  const create = async () => {
    if (isCreating) return;
    setIsCreating(true);
    setError("");

    // Make sure the snapshot reflects what's currently on the board.
    await flushPendingSave();

    const label = window.prompt(
      "Label this snapshot (optional):",
      `Snapshot ${formatSnapshotTimestamp(Date.now())}`,
    );

    // User cancelled.
    if (label === null) {
      setIsCreating(false);
      return;
    }

    try {
      await createMoodboardSnapshot(characterId, label);
      await fetchSnapshots();
      setIsMenuOpen(true);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Snapshot failed.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const load = async (snapshot) => {
    const labelText = snapshot.label
      ? `"${snapshot.label}"`
      : `from ${formatSnapshotTimestamp(snapshot.createdAt)}`;
    const confirmed = window.confirm(
      `Replace the current board with snapshot ${labelText}?\n\nThe current board will be auto-saved over and replaced. Take a snapshot first if you want to keep it.`,
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const payload = await getMoodboardSnapshot(characterId, snapshot.id);
      onLoadSnapshot(payload);
      setIsMenuOpen(false);
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not load snapshot.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (snapshot) => {
    const labelText = snapshot.label
      ? `"${snapshot.label}"`
      : `from ${formatSnapshotTimestamp(snapshot.createdAt)}`;
    const confirmed = window.confirm(
      `Permanently delete snapshot ${labelText}?`,
    );
    if (!confirmed) return;

    try {
      await deleteMoodboardSnapshot(characterId, snapshot.id);
      await fetchSnapshots();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not delete snapshot.",
      );
    }
  };

  return {
    snapshots,
    snapshotMenuRef: menuRef,
    isSnapshotMenuOpen: isMenuOpen,
    isCreatingSnapshot: isCreating,
    isLoadingSnapshot: isLoading,
    snapshotError: error,
    openSnapshotMenu: openMenu,
    closeSnapshotMenu: closeMenu,
    createSnapshot: create,
    loadSnapshot: load,
    deleteSnapshot: remove,
  };
};
