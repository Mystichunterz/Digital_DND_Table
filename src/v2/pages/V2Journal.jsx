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

const V2Journal = () => {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [draftBody, setDraftBody] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [sortBy, setSortBy] = useState("updated");
  const [tagFilter, setTagFilter] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const refreshList = async () => {
    try {
      const fresh = await listNotes();
      setNotes(fresh);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const selectNote = async (id) => {
    setSelectedId(id);
    setEditMode(false);
    try {
      const note = await getNote(id);
      setSelectedNote(note);
      setDraftBody(note.body);
    } catch (err) {
      setError(err.message);
    }
  };

  const replaceSummary = (note) => {
    setNotes((current) => {
      const filtered = current.filter((existing) => existing.id !== note.id);
      return [
        {
          id: note.id,
          title: note.title,
          tags: note.tags,
          created: note.created,
          updated: note.updated,
        },
        ...filtered,
      ];
    });
  };

  const handleCreate = async () => {
    try {
      const created = await createNote({ title: "Untitled", body: "", tags: [] });
      replaceSummary(created);
      setSelectedId(created.id);
      setSelectedNote(created);
      setDraftBody(created.body);
      setEditMode(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleMode = async () => {
    if (!selectedNote) return;
    if (editMode) {
      setSaving(true);
      try {
        const updated = await updateNote(selectedNote.id, { body: draftBody });
        setSelectedNote(updated);
        setDraftBody(updated.body);
        replaceSummary(updated);
        setEditMode(false);
      } catch (err) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    } else {
      setEditMode(true);
    }
  };

  const handleTitleChange = async (newTitle, commit) => {
    if (!selectedNote) return;
    setSelectedNote({ ...selectedNote, title: newTitle });
    if (!commit) return;
    if (newTitle.trim() === "" || newTitle === selectedNote.title) return;
    try {
      const updated = await updateNote(selectedNote.id, { title: newTitle });
      setSelectedNote(updated);
      replaceSummary(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTagsChange = async (newTags) => {
    if (!selectedNote) return;
    const previous = selectedNote.tags;
    setSelectedNote({ ...selectedNote, tags: newTags });
    try {
      const updated = await updateNote(selectedNote.id, { tags: newTags });
      setSelectedNote(updated);
      replaceSummary(updated);
    } catch (err) {
      setError(err.message);
      setSelectedNote({ ...selectedNote, tags: previous });
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    if (!window.confirm(`Delete "${selectedNote.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteNote(selectedNote.id);
      setNotes((current) => current.filter((note) => note.id !== selectedNote.id));
      setSelectedId(null);
      setSelectedNote(null);
      setDraftBody("");
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
        onSelect={selectNote}
        onCreate={handleCreate}
      />
      <section className="v2-journal-main">
        {error ? (
          <div className="v2-journal-error" onClick={() => setError(null)}>
            {error}
          </div>
        ) : null}
        <JournalNoteView
          note={selectedNote}
          draftBody={draftBody}
          onDraftBodyChange={setDraftBody}
          editMode={editMode}
          onToggleMode={handleToggleMode}
          onTitleChange={handleTitleChange}
          onTagsChange={handleTagsChange}
          onDelete={handleDelete}
          saving={saving}
        />
      </section>
    </div>
  );
};

export default V2Journal;
