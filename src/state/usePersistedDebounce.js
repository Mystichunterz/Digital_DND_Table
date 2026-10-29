import { useEffect, useRef } from "react";
import { usePersistenceStatus } from "./PersistenceStatusContext";

const DEFAULT_DEBOUNCE_MS = 500;

// Debounced PATCH that survives component unmount.
// On state change, schedules the PATCH after `delay` ms.
// On unmount, immediately flushes any unsent change so navigation
// between tabs doesn't drop in-flight edits.
//
// Race-safety: `body` is captured into a ref synchronously every render,
// so the unmount cleanup always sees the latest value even if the user
// changes state and navigates away before any effect can run.
export function usePersistedDebounce({
  enabled,
  url,
  body,
  delay = DEFAULT_DEBOUNCE_MS,
  onError,
}) {
  const { beginSave, endSave } = usePersistenceStatus();

  const latestBodyRef = useRef(null);
  const lastSentSerializedRef = useRef(null);
  const timerRef = useRef(null);
  const urlRef = useRef(url);
  const onErrorRef = useRef(onError);
  const beginSaveRef = useRef(beginSave);
  const endSaveRef = useRef(endSave);

  // Synchronous render-phase ref updates.
  // Safe because we're only writing to refs, not triggering re-renders.
  urlRef.current = url;
  onErrorRef.current = onError;
  beginSaveRef.current = beginSave;
  endSaveRef.current = endSave;
  if (enabled) {
    latestBodyRef.current = body;
  }

  const serialized = enabled ? JSON.stringify(body) : "";

  const sendNow = (keepalive) => {
    const snapshot = latestBodyRef.current;
    if (snapshot === null) {
      return;
    }

    const snapshotSerialized = JSON.stringify(snapshot);
    if (snapshotSerialized === lastSentSerializedRef.current) {
      return;
    }

    lastSentSerializedRef.current = snapshotSerialized;
    beginSaveRef.current?.();

    try {
      fetch(urlRef.current, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: snapshotSerialized,
        keepalive,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Save failed: HTTP ${response.status}`);
          }
          endSaveRef.current?.({ ok: true });
        })
        .catch((error) => {
          // Allow a retry of this body if the request itself failed.
          lastSentSerializedRef.current = null;
          endSaveRef.current?.({ ok: false, error });
          onErrorRef.current?.(error);
        });
    } catch (error) {
      lastSentSerializedRef.current = null;
      endSaveRef.current?.({ ok: false, error });
      onErrorRef.current?.(error);
    }
  };

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      sendNow(false);
    }, delay);

    return undefined;
  }, [enabled, serialized, delay]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      sendNow(true);
    };
  }, []);
}
