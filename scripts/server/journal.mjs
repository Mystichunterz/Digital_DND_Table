import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import { isPathInside } from "./utils.mjs";

const NOTES_ROOT = path.join(process.cwd(), "notes");

const MAX_TITLE_LEN = 200;
const MAX_BODY_BYTES = 1024 * 1024;
const MAX_TAGS = 20;
const NOTE_ID_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;
const TAG_RE = /^[a-zA-Z0-9 _-]{1,40}$/;

const sanitizeNoteId = (rawId) =>
  String(rawId ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const slugifyTitle = (title) =>
  String(title ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "note";

const generateNoteId = (title) =>
  `${slugifyTitle(title)}-${crypto.randomBytes(2).toString("hex")}`;

const noteFilePath = (id) => path.join(NOTES_ROOT, `${id}.md`);

export const ensureNotesDirectoryExists = async () => {
  await fs.mkdir(NOTES_ROOT, { recursive: true });
};

const validateTags = (rawTags) => {
  if (rawTags === undefined) return [];
  if (!Array.isArray(rawTags)) {
    throw new Error("tags must be an array of strings.");
  }
  if (rawTags.length > MAX_TAGS) {
    throw new Error(`tags array exceeds limit of ${MAX_TAGS}.`);
  }
  return rawTags.map((tag) => {
    const trimmed = String(tag ?? "").trim();
    if (!TAG_RE.test(trimmed)) {
      throw new Error(`Invalid tag: ${trimmed}`);
    }
    return trimmed;
  });
};

const readNoteFile = async (id) => {
  const filePath = noteFilePath(id);
  const resolved = path.resolve(filePath);
  if (!isPathInside(NOTES_ROOT, resolved)) {
    throw new Error("Note path escapes notes directory.");
  }
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data ?? {};
  return {
    id: String(data.id ?? id),
    title: String(data.title ?? "Untitled"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    created: String(data.created ?? new Date().toISOString()),
    updated: String(data.updated ?? new Date().toISOString()),
    body: parsed.content ?? "",
  };
};

const writeNoteFile = async (note) => {
  const front = {
    id: note.id,
    title: note.title,
    tags: note.tags,
    created: note.created,
    updated: note.updated,
  };
  const serialized = matter.stringify(note.body ?? "", front);
  const filePath = noteFilePath(note.id);
  const tempPath = `${filePath}.${Date.now()}.${Math.random()
    .toString(16)
    .slice(2)}.tmp`;
  await fs.writeFile(tempPath, serialized, "utf8");
  await fs.rename(tempPath, filePath);
};

export const registerJournalRoutes = (app) => {
  app.get("/api/journal/notes", async (request, response, next) => {
    try {
      const includeBody = String(request.query.include ?? "")
        .split(",")
        .map((part) => part.trim())
        .includes("body");
      const entries = await fs.readdir(NOTES_ROOT, { withFileTypes: true });
      const summaries = [];
      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
        const id = entry.name.slice(0, -3);
        try {
          const note = await readNoteFile(id);
          const summary = {
            id: note.id,
            title: note.title,
            tags: note.tags,
            created: note.created,
            updated: note.updated,
          };
          if (includeBody) summary.body = note.body;
          summaries.push(summary);
        } catch (error) {
          console.warn(
            `[journal] Skipped malformed note file ${id}.md:`,
            error.message,
          );
        }
      }
      summaries.sort((a, b) => b.updated.localeCompare(a.updated));
      response.json({ notes: summaries });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/journal/notes/:id", async (request, response, next) => {
    try {
      const id = sanitizeNoteId(request.params.id);
      if (!id || !NOTE_ID_RE.test(id)) {
        response.status(400).json({ message: "Invalid note id." });
        return;
      }
      try {
        const note = await readNoteFile(id);
        response.json(note);
      } catch (error) {
        if (error.code === "ENOENT") {
          response.status(404).json({ message: "Note not found." });
          return;
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/journal/notes", async (request, response, next) => {
    try {
      const rawTitle = String(request.body?.title ?? "").trim();
      if (!rawTitle) {
        response.status(400).json({ message: "title is required." });
        return;
      }
      if (rawTitle.length > MAX_TITLE_LEN) {
        response.status(400).json({ message: "title too long." });
        return;
      }
      const body = String(request.body?.body ?? "");
      if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
        response.status(400).json({ message: "body too large." });
        return;
      }
      const tags = validateTags(request.body?.tags);

      let id = generateNoteId(rawTitle);
      while (true) {
        try {
          await fs.access(noteFilePath(id));
          id = generateNoteId(rawTitle);
        } catch {
          break;
        }
      }
      const now = new Date().toISOString();
      const note = {
        id,
        title: rawTitle,
        tags,
        created: now,
        updated: now,
        body,
      };
      await writeNoteFile(note);
      response.status(201).json(note);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/journal/notes/:id", async (request, response, next) => {
    try {
      const id = sanitizeNoteId(request.params.id);
      if (!id || !NOTE_ID_RE.test(id)) {
        response.status(400).json({ message: "Invalid note id." });
        return;
      }
      let existing;
      try {
        existing = await readNoteFile(id);
      } catch (error) {
        if (error.code === "ENOENT") {
          response.status(404).json({ message: "Note not found." });
          return;
        }
        throw error;
      }
      const updates = request.body ?? {};
      if (updates.title !== undefined) {
        const t = String(updates.title).trim();
        if (!t) {
          response.status(400).json({ message: "title cannot be empty." });
          return;
        }
        if (t.length > MAX_TITLE_LEN) {
          response.status(400).json({ message: "title too long." });
          return;
        }
        existing.title = t;
      }
      if (updates.tags !== undefined) {
        existing.tags = validateTags(updates.tags);
      }
      if (updates.body !== undefined) {
        const b = String(updates.body);
        if (Buffer.byteLength(b, "utf8") > MAX_BODY_BYTES) {
          response.status(400).json({ message: "body too large." });
          return;
        }
        existing.body = b;
      }
      existing.updated = new Date().toISOString();
      await writeNoteFile(existing);
      response.json(existing);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/journal/notes/:id", async (request, response, next) => {
    try {
      const id = sanitizeNoteId(request.params.id);
      if (!id || !NOTE_ID_RE.test(id)) {
        response.status(400).json({ message: "Invalid note id." });
        return;
      }
      const filePath = noteFilePath(id);
      const resolved = path.resolve(filePath);
      if (!isPathInside(NOTES_ROOT, resolved)) {
        response.status(400).json({ message: "Invalid note path." });
        return;
      }
      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code === "ENOENT") {
          response.status(404).json({ message: "Note not found." });
          return;
        }
        throw error;
      }
      response.json({ deleted: id });
    } catch (error) {
      next(error);
    }
  });
};
