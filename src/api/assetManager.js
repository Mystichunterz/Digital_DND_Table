// HTTP wrappers for the asset-manager endpoints (ability manifest + icon
// uploads). Non-OK responses reject with the server's message.

const BASE = "/api/asset-manager";

const readApiErrorMessage = async (response) => {
  try {
    const payload = await response.json();

    if (payload && typeof payload.message === "string") {
      return payload.message;
    }
  } catch {
    // fall through to default message
  }

  return `Request failed with status ${response.status}.`;
};

const readJson = async (response) => {
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }
  return response.json();
};

// Manifest + icon list, fetched together. The manifest error wins if both
// requests fail.
export const fetchCatalog = async () => {
  const [manifestResponse, iconsResponse] = await Promise.all([
    fetch(`${BASE}/manifest`),
    fetch(`${BASE}/icons`),
  ]);
  const manifest = await readJson(manifestResponse);
  const icons = await readJson(iconsResponse);
  return { manifest, icons };
};

export const uploadIcons = async (group, files) => {
  const payload = new FormData();
  payload.append("group", group);
  files.forEach((file) => {
    payload.append("icons", file);
  });

  return readJson(
    await fetch(`${BASE}/upload-icons`, { method: "POST", body: payload }),
  );
};

export const saveAbility = async (ability) =>
  readJson(
    await fetch(`${BASE}/abilities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ability),
    }),
  );
