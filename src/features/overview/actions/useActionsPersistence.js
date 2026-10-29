import { characterStateUrl } from "@/api/characterState";
import { usePersistedDebounce } from "@/state/usePersistedDebounce";
import { useCharacterStateHydration } from "@/state/useCharacterStateHydration";

// Loads the panel's saved layout + resources, then auto-saves `state`.
export const useActionsPersistence = ({ state, onHydrate }) => {
  const isHydrated = useCharacterStateHydration(onHydrate);

  usePersistedDebounce({
    enabled: isHydrated,
    url: characterStateUrl(),
    body: state,
  });

  return { isHydrated };
};
