import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const PersistenceStatusContext = createContext(null);

const NOOP = () => {};

const NOOP_VALUE = {
  loadingCount: 0,
  savingCount: 0,
  lastSavedAt: null,
  lastError: null,
  beginLoad: NOOP,
  endLoad: NOOP,
  beginSave: NOOP,
  endSave: NOOP,
};

export const PersistenceStatusProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);
  const [savingCount, setSavingCount] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [lastError, setLastError] = useState(null);

  const beginLoad = useCallback(() => {
    setLoadingCount((n) => n + 1);
  }, []);

  const endLoad = useCallback(() => {
    setLoadingCount((n) => (n > 0 ? n - 1 : 0));
  }, []);

  const beginSave = useCallback(() => {
    setLastError(null);
    setSavingCount((n) => n + 1);
  }, []);

  const endSave = useCallback((result) => {
    setSavingCount((n) => (n > 0 ? n - 1 : 0));
    if (result?.ok) {
      setLastSavedAt(Date.now());
    } else if (result?.error) {
      setLastError(result.error);
    }
  }, []);

  const value = useMemo(
    () => ({
      loadingCount,
      savingCount,
      lastSavedAt,
      lastError,
      beginLoad,
      endLoad,
      beginSave,
      endSave,
    }),
    [
      loadingCount,
      savingCount,
      lastSavedAt,
      lastError,
      beginLoad,
      endLoad,
      beginSave,
      endSave,
    ],
  );

  return (
    <PersistenceStatusContext.Provider value={value}>
      {children}
    </PersistenceStatusContext.Provider>
  );
};

export const usePersistenceStatus = () => {
  const ctx = useContext(PersistenceStatusContext);
  return ctx ?? NOOP_VALUE;
};

// Reports a load lifecycle to the status context for any panel that
// already manages its own `isHydrated` flag. Begin/end calls stay balanced
// across mount, hydration, and unmount — including unmount-before-hydration.
export const useTrackHydration = (isHydrated) => {
  const { beginLoad, endLoad } = usePersistenceStatus();

  useEffect(() => {
    if (isHydrated) {
      return undefined;
    }
    beginLoad();
    return () => endLoad();
  }, [isHydrated, beginLoad, endLoad]);
};
