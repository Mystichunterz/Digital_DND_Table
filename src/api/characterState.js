// Per-character state lives in the local API's SQLite store, one JSON
// document per character. Panels PATCH their own slice of it.

// The app tracks a single character for now.
export const CHARACTER_ID = "default";

export const characterStateUrl = (characterId = CHARACTER_ID) =>
  `/api/state/${characterId}`;

// Resolves to the saved state object, or null when nothing has been saved
// yet (404) or the body isn't an object. Network failures reject.
export const fetchCharacterState = async (characterId = CHARACTER_ID) => {
  const response = await fetch(characterStateUrl(characterId));
  if (!response.ok) {
    return null;
  }
  const saved = await response.json();
  return saved && typeof saved === "object" ? saved : null;
};
