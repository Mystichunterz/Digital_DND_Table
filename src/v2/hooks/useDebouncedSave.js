import { useCallback, useEffect, useRef, useState } from "react";

const FADE_MS = 1500;

export const useDebouncedSave = (initialValue, save, debounceMs = 600) => {
  const [value, setLocalValue] = useState(initialValue);
  const [status, setStatus] = useState("idle");
  const valueRef = useRef(initialValue);
  const lastSavedRef = useRef(initialValue);
  const timerRef = useRef(null);
  const fadeRef = useRef(null);
  const saveRef = useRef(save);
  const mountedRef = useRef(true);

  saveRef.current = save;

  const safeSetStatus = useCallback((next) => {
    if (mountedRef.current) setStatus(next);
  }, []);

  const performSave = useCallback(async () => {
    const next = valueRef.current;
    if (next === lastSavedRef.current) return;
    safeSetStatus("saving");
    try {
      await saveRef.current(next);
      lastSavedRef.current = next;
      safeSetStatus("saved");
      if (fadeRef.current) clearTimeout(fadeRef.current);
      fadeRef.current = setTimeout(() => {
        fadeRef.current = null;
        safeSetStatus("idle");
      }, FADE_MS);
    } catch {
      safeSetStatus("dirty");
    }
  }, [safeSetStatus]);

  const setValue = useCallback(
    (next) => {
      valueRef.current = next;
      setLocalValue(next);
      if (next === lastSavedRef.current) {
        safeSetStatus("idle");
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
      safeSetStatus("dirty");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        performSave();
      }, debounceMs);
    },
    [debounceMs, performSave, safeSetStatus],
  );

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await performSave();
  }, [performSave]);

  const reset = useCallback(
    (next) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      valueRef.current = next;
      lastSavedRef.current = next;
      setLocalValue(next);
      safeSetStatus("idle");
    },
    [safeSetStatus],
  );

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (fadeRef.current) {
        clearTimeout(fadeRef.current);
        fadeRef.current = null;
      }
      if (valueRef.current !== lastSavedRef.current) {
        saveRef.current(valueRef.current).catch(() => {});
      }
    };
  }, []);

  return { value, setValue, status, flush, reset };
};
