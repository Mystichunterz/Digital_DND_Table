const BASE = "/api/journal/notes";

const handle = async (response) => {
  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      // ignore parse failure
    }
    throw new Error(message);
  }
  return response.json();
};

export const listNotes = async ({ includeBody = false } = {}) => {
  const url = includeBody ? `${BASE}?include=body` : BASE;
  const data = await handle(await fetch(url));
  return Array.isArray(data?.notes) ? data.notes : [];
};

export const getNote = async (id) =>
  handle(await fetch(`${BASE}/${encodeURIComponent(id)}`));

export const createNote = async (payload) =>
  handle(
    await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );

export const updateNote = async (id, payload) =>
  handle(
    await fetch(`${BASE}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );

export const deleteNote = async (id) =>
  handle(
    await fetch(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" }),
  );
