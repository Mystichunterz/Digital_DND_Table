// HTTP wrappers for the moodboard / snapshot endpoints. Each function
// throws an Error with a `.statusCode` field when the server returns a
// non-OK response, so the UI layer can translate to a user-facing
// status string.

const STATE_BASE = (characterId) => `/api/state/${characterId}`;
const SNAPSHOTS_BASE = (characterId) =>
  `${STATE_BASE(characterId)}/moodboard/snapshots`;

const failedResponse = (response, fallbackMessage) => {
  const error = new Error(`${fallbackMessage} (${response.status}).`);
  error.statusCode = response.status;
  return error;
};

export const patchMoodboardItems = async (characterId, items) => {
  await fetch(STATE_BASE(characterId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moodboard: { items } }),
  });
};

export const listMoodboardSnapshots = async (characterId) => {
  const response = await fetch(SNAPSHOTS_BASE(characterId));
  if (!response.ok) {
    throw failedResponse(response, "Could not load snapshots");
  }
  const payload = await response.json();
  return Array.isArray(payload?.snapshots) ? payload.snapshots : [];
};

export const createMoodboardSnapshot = async (characterId, label) => {
  const response = await fetch(SNAPSHOTS_BASE(characterId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label }),
  });
  if (!response.ok) {
    let message = `Snapshot failed (${response.status}).`;
    try {
      const payload = await response.json();
      if (payload?.message) message = payload.message;
    } catch {
      // keep status-only message
    }
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }
};

export const getMoodboardSnapshot = async (characterId, snapshotId) => {
  const response = await fetch(`${SNAPSHOTS_BASE(characterId)}/${snapshotId}`);
  if (!response.ok) {
    throw failedResponse(response, "Could not load snapshot");
  }
  return response.json();
};

export const deleteMoodboardSnapshot = async (characterId, snapshotId) => {
  const response = await fetch(`${SNAPSHOTS_BASE(characterId)}/${snapshotId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw failedResponse(response, "Could not delete snapshot");
  }
};
