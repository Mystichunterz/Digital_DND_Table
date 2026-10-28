import { useEffect, useState } from "react";
import { usePersistedDebounce } from "../../../../state/usePersistedDebounce";
import { useTrackHydration } from "../../../../state/PersistenceStatusContext";

export const useActionsPersistence = ({ characterId, state, onHydrate }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const hydrate = async () => {
      try {
        const response = await fetch(`/api/state/${characterId}`);

        if (isCancelled) {
          return;
        }

        if (response.ok) {
          const saved = await response.json();

          if (isCancelled) {
            return;
          }

          if (saved && typeof saved === "object") {
            onHydrate(saved);
          }
        }
      } catch {
        // Server unavailable — fall back to defaults silently.
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
    // onHydrate captures setters from the parent; intentionally not in deps
    // (would re-fetch on every render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId]);

  useTrackHydration(isHydrated);

  usePersistedDebounce({
    enabled: isHydrated,
    url: `/api/state/${characterId}`,
    body: state,
  });

  return { isHydrated };
};
