import { useEffect, useRef, useState } from "react";
import { CHARACTER_ID, fetchCharacterState } from "@/api/characterState";
import { useTrackHydration } from "./PersistenceStatusContext";

// Loads the saved character state once per characterId and hands it to
// onHydrate. Returns isHydrated, which flips to true once the load settles
// — even if the server is down or nothing is saved yet — so callers only
// start persisting after they've had a chance to see existing state.
export function useCharacterStateHydration(
  onHydrate,
  characterId = CHARACTER_ID,
) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Latest callback without re-running the fetch when it changes identity.
  const onHydrateRef = useRef(onHydrate);
  onHydrateRef.current = onHydrate;

  useEffect(() => {
    let isCancelled = false;

    fetchCharacterState(characterId)
      .then((saved) => {
        if (!isCancelled && saved) {
          onHydrateRef.current(saved);
        }
      })
      .catch(() => {
        // Server unavailable — keep defaults.
      })
      .finally(() => {
        if (!isCancelled) {
          setIsHydrated(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [characterId]);

  useTrackHydration(isHydrated);

  return isHydrated;
}
