import { useCallback, useEffect, useRef, useState } from "react";
import { useCharacterStateHydration } from "@/state/useCharacterStateHydration";
import { PERSIST_DEBOUNCE_MS } from "./constants";
import { characterStateUrl } from "@/api/characterState";
import { patchMoodboardItems } from "@/api/moodboard";

const formatPayloadTooLargeMessage = (status, sizeMb) =>
  `Save failed (${status}): ${sizeMb} MB body exceeds the running API server's limit. Stop the dev:api process (Ctrl+C in its terminal) and restart it with \`npm run dev:api\` — file edits don't take effect until restart.`;

export const useMoodboardPersistence = ({ characterId, items, onHydrate }) => {
  const [saveStatus, setSaveStatus] = useState({ kind: "idle", message: "" });
  const pendingItemsRef = useRef(null);

  const isHydrated = useCharacterStateHydration((saved) => {
    if (saved.moodboard && typeof saved.moodboard === "object") {
      onHydrate(saved.moodboard);
    }
  }, characterId);

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
        const response = await fetch(characterStateUrl(characterId), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body,
        });

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
            ? formatPayloadTooLargeMessage(response.status, sizeMb)
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
  }, [characterId, isHydrated, items]);

  // Best-effort flush before the page unloads / hides.
  useEffect(() => {
    const flush = () => {
      const snapshot = pendingItemsRef.current;
      if (!snapshot) return;
      pendingItemsRef.current = null;
      try {
        fetch(characterStateUrl(characterId), {
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
  }, [characterId]);

  const flushPendingSave = useCallback(async () => {
    const snapshot = pendingItemsRef.current;
    if (!snapshot) return;
    pendingItemsRef.current = null;
    try {
      await patchMoodboardItems(characterId, snapshot);
    } catch {
      // Surfaced by the regular debounced save effect.
    }
  }, [characterId]);

  return { isHydrated, saveStatus, flushPendingSave };
};
