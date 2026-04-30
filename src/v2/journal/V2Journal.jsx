import { useMemo } from "react";
import NotePane from "./NotePane";
import Sidebar from "./Sidebar";
import { useJournal } from "./state";
import "./styles.scss";

const V2Journal = () => {
  const { state, actions } = useJournal();

  const notes = useMemo(
    () => state.order.map((id) => state.byId[id]).filter(Boolean),
    [state.order, state.byId],
  );

  const selectedNote = state.selectedId
    ? state.byId[state.selectedId] ?? null
    : null;
  const selectedStatus = state.selectedId
    ? state.status[state.selectedId] ?? "idle"
    : "idle";
  const selectedError = state.selectedId
    ? state.errors[state.selectedId] ?? null
    : null;

  return (
    <div className="v2-journal">
      <Sidebar
        notes={notes}
        selectedId={state.selectedId}
        onSelect={actions.select}
        onCreate={actions.create}
      />
      <section className="v2-journal-main">
        {state.globalError ? (
          <div
            className="v2-journal-error"
            onClick={actions.dismissError}
            role="button"
            tabIndex={0}
          >
            {state.globalError}
          </div>
        ) : null}
        <NotePane
          note={selectedNote}
          status={selectedStatus}
          error={selectedError}
          actions={actions}
        />
      </section>
    </div>
  );
};

export default V2Journal;
