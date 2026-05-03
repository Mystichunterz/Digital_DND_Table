import { useEffect, useState } from "react";
import { usePersistenceStatus } from "../state/PersistenceStatusContext";
import "../styles/components/v2-persistence-indicator.scss";

// On localhost the API answers in single-digit ms, which would make
// the loading/saving pill flicker too fast to read. Latch each state
// on for at least this long after the underlying counter hits zero.
const MIN_VISIBLE_MS = 800;

const formatRelative = (ms) => {
  if (ms < 5_000) return "just now";
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  return `${Math.floor(ms / 3_600_000)}h ago`;
};

const V2PersistenceIndicator = () => {
  const { loadingCount, savingCount, lastSavedAt, lastError } =
    usePersistenceStatus();
  const [now, setNow] = useState(() => Date.now());
  const [showLoading, setShowLoading] = useState(false);
  const [showSaving, setShowSaving] = useState(false);

  useEffect(() => {
    if (loadingCount > 0) {
      setShowLoading(true);
      return undefined;
    }
    if (!showLoading) return undefined;
    const t = setTimeout(() => setShowLoading(false), MIN_VISIBLE_MS);
    return () => clearTimeout(t);
  }, [loadingCount, showLoading]);

  useEffect(() => {
    if (savingCount > 0) {
      setShowSaving(true);
      return undefined;
    }
    if (!showSaving) return undefined;
    const t = setTimeout(() => setShowSaving(false), MIN_VISIBLE_MS);
    return () => clearTimeout(t);
  }, [savingCount, showSaving]);

  useEffect(() => {
    if (!lastSavedAt) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(id);
  }, [lastSavedAt]);

  let kind;
  let label;
  if (showLoading) {
    kind = "loading";
    label = "Loading saved state…";
  } else if (showSaving) {
    kind = "saving";
    label = "Saving…";
  } else if (lastError) {
    kind = "error";
    label = "Save failed";
  } else if (lastSavedAt) {
    kind = "saved";
    label = `Saved ${formatRelative(now - lastSavedAt)}`;
  } else {
    return null;
  }

  return (
    <div
      className={`v2-persistence-indicator is-${kind}`}
      role="status"
      aria-live="polite"
      title={lastError ? String(lastError?.message ?? lastError) : undefined}
    >
      <span className="v2-persistence-indicator-dot" aria-hidden="true" />
      <span className="v2-persistence-indicator-label">{label}</span>
    </div>
  );
};

export default V2PersistenceIndicator;
