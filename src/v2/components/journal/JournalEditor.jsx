import { useEffect } from "react";
import { useDebouncedSave } from "./useDebouncedSave";
import { updateNote } from "../../data/journalApi";

const JournalEditor = ({ noteId, initialBody, onSaved, onStatusChange }) => {
  const { value, setValue, status } = useDebouncedSave(
    initialBody,
    async (next) => {
      const updated = await updateNote(noteId, { body: next });
      if (onSaved) onSaved(updated);
    },
  );

  useEffect(() => {
    if (onStatusChange) onStatusChange(status);
  }, [status, onStatusChange]);

  return (
    <textarea
      className="v2-journal-editor"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder="Begin your entry..."
      spellCheck
    />
  );
};

export default JournalEditor;
