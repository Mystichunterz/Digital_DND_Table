import { useEffect, useState } from "react";
import JournalSidebar from "../components/journal/JournalSidebar";
import JournalNoteView from "../components/journal/JournalNoteView";
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
} from "../data/journalApi";
import "../styles/v2-journal.scss";

const summarize = (note) => ({
  id: note.id,
  title: note.title,
  tags: note.tags,
  created: note.created,
  updated: note.updated,
  body: note.body ?? "",
});

const V2Journal = () => {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [sortBy, setSortBy] = useState("updated");
  const [tagFilter, setTagFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  const refreshList = async () => {
    try {
      setNotes(await listNotes({ includeBody: true }));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const replaceSummary = (note) => {
    setNotes((current) => {
      const filtered = current.filter((existing) => existing.id !== note.id);
      return [summarize(note), ...filtered];
    });
  };

  const handleSaved = (updated) => {
    setSelectedNote(updated);
    replaceSummary(updated);
  };

  const selectNote = async (id) => {
    setSelectedId(id);
    setEditMode(false);
    try {
      const note = await getNote(id);
      setSelectedNote(note);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    try {
      const created = await createNote({
        title: "Untitled",
        body: "",
        tags: [],
      });
      replaceSummary(created);
      setSelectedId(created.id);
      setSelectedNote(created);
      setEditMode(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleMode = () => {
    setEditMode((current) => !current);
  };

  const handleTagsChange = async (newTags) => {
    if (!selectedNote) return;
    const previous = selectedNote.tags;
    setSelectedNote({ ...selectedNote, tags: newTags });
    try {
      const updated = await updateNote(selectedNote.id, { tags: newTags });
      handleSaved(updated);
    } catch (err) {
      setError(err.message);
      setSelectedNote((current) =>
        current ? { ...current, tags: previous } : current,
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    if (
      !window.confirm(
        `Delete "${selectedNote.title}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await deleteNote(selectedNote.id);
      setNotes((current) =>
        current.filter((note) => note.id !== selectedNote.id),
      );
      setSelectedId(null);
      setSelectedNote(null);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="v2-journal">
      <JournalSidebar
        notes={notes}
        selectedId={selectedId}
        sortBy={sortBy}
        onSortChange={setSortBy}
        tagFilter={tagFilter}
        onTagFilterChange={setTagFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelect={selectNote}
        onCreate={handleCreate}
      />
      <section className="v2-journal-main">
        {error ? (
          <div
            className="v2-journal-error"
            onClick={() => setError(null)}
          >
            {error}
          </div>
        ) : null}
        <JournalNoteView
          note={selectedNote}
          editMode={editMode}
          onToggleMode={handleToggleMode}
          onSaved={handleSaved}
          onTagsChange={handleTagsChange}
          onDelete={handleDelete}
        />
      </section>
    </div>
  );
};

export default V2Journal;
