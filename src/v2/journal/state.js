import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  createNote as apiCreate,
  deleteNote as apiDelete,
  listNotes as apiList,
  updateNote as apiUpdate,
} from "./api";

const SAVE_DEBOUNCE_MS = 500;
const SAVING_INDICATOR_DELAY_MS = 350;
const SAVED_FADE_MS = 1200;

const SAVE_FIELDS = ["title", "body", "tags"];

const noteFromServer = (note) => ({
  id: note.id,
  title: note.title,
  body: note.body ?? "",
  tags: Array.isArray(note.tags) ? [...note.tags] : [],
  created: note.created,
  updated: note.updated,
});

const tagsEqual = (a, b) => {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  return true;
};

const isFieldDirty = (local, synced, field) => {
  if (!synced) return true;
  if (field === "tags") return !tagsEqual(local.tags, synced.tags);
  return local[field] !== synced[field];
};

const isDirty = (local, synced) =>
  SAVE_FIELDS.some((f) => isFieldDirty(local, synced, f));

const initialState = {
  byId: {},
  order: [],
  selectedId: null,
  status: {},
  errors: {},
  loading: true,
  globalError: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "loadStart":
      return { ...state, loading: true, globalError: null };

    case "loadSuccess": {
      const byId = {};
      const order = [];
      for (const note of action.notes) {
        byId[note.id] = note;
        order.push(note.id);
      }
      return { ...state, byId, order, loading: false };
    }

    case "loadError":
      return { ...state, loading: false, globalError: action.message };

    case "select":
      return { ...state, selectedId: action.id };

    case "patchField": {
      const existing = state.byId[action.id];
      if (!existing) return state;
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.id]: { ...existing, [action.field]: action.value },
        },
        status: { ...state.status, [action.id]: action.status ?? "dirty" },
      };
    }

    case "setStatus":
      return {
        ...state,
        status: { ...state.status, [action.id]: action.status },
        errors:
          action.status === "error"
            ? { ...state.errors, [action.id]: action.message ?? "Save failed" }
            : { ...state.errors, [action.id]: null },
      };

    case "syncTimestamp": {
      const existing = state.byId[action.id];
      if (!existing) return state;
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.id]: { ...existing, updated: action.updated },
        },
      };
    }

    case "noteCreated": {
      const { note } = action;
      return {
        ...state,
        byId: { ...state.byId, [note.id]: note },
        order: [note.id, ...state.order.filter((id) => id !== note.id)],
        selectedId: note.id,
      };
    }

    case "noteDeleted": {
      const { [action.id]: _drop, ...byId } = state.byId;
      const { [action.id]: _s, ...status } = state.status;
      const { [action.id]: _e, ...errors } = state.errors;
      return {
        ...state,
        byId,
        order: state.order.filter((id) => id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
        status,
        errors,
      };
    }

    case "globalError":
      return { ...state, globalError: action.message };

    default:
      return state;
  }
};

export const useJournal = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Server-confirmed values, off the React tree to avoid re-renders.
  const syncedRef = useRef({});

  // Per-note save coordination.
  const debounceTimerRef = useRef({});
  const savingDelayTimerRef = useRef({});
  const savedFadeTimerRef = useRef({});
  const inflightRef = useRef({});
  const localByIdRef = useRef({});
  const stateRef = useRef(state);
  stateRef.current = state;

  const clearTimer = (bucket, id) => {
    if (bucket.current[id]) {
      clearTimeout(bucket.current[id]);
      bucket.current[id] = null;
    }
  };

  const setStatusWithFade = useCallback((id, status) => {
    dispatch({ type: "setStatus", id, status });
    clearTimer(savedFadeTimerRef, id);
    if (status === "saved") {
      savedFadeTimerRef.current[id] = setTimeout(() => {
        savedFadeTimerRef.current[id] = null;
        if (stateRef.current.status[id] === "saved") {
          dispatch({ type: "setStatus", id, status: "idle" });
        }
      }, SAVED_FADE_MS);
    }
  }, []);

  const performCommit = useCallback(
    async (id) => {
      if (inflightRef.current[id]) return;
      const local = localByIdRef.current[id];
      const synced = syncedRef.current[id];
      if (!local || !isDirty(local, synced)) {
        if (stateRef.current.status[id] === "dirty") {
          setStatusWithFade(id, "idle");
        }
        return;
      }

      const snapshot = {
        title: local.title,
        body: local.body,
        tags: [...local.tags],
      };

      inflightRef.current[id] = true;

      // Show "Saving..." only if the request takes longer than the threshold.
      clearTimer(savingDelayTimerRef, id);
      savingDelayTimerRef.current[id] = setTimeout(() => {
        savingDelayTimerRef.current[id] = null;
        if (inflightRef.current[id]) {
          dispatch({ type: "setStatus", id, status: "saving" });
        }
      }, SAVING_INDICATOR_DELAY_MS);

      try {
        const response = await apiUpdate(id, snapshot);
        syncedRef.current[id] = {
          ...snapshot,
          created: response.created,
          updated: response.updated,
        };
        dispatch({ type: "syncTimestamp", id, updated: response.updated });

        clearTimer(savingDelayTimerRef, id);

        const stillDirty = isDirty(localByIdRef.current[id], syncedRef.current[id]);
        if (stillDirty) {
          setStatusWithFade(id, "dirty");
          clearTimer(debounceTimerRef, id);
          debounceTimerRef.current[id] = setTimeout(() => {
            debounceTimerRef.current[id] = null;
            performCommit(id);
          }, SAVE_DEBOUNCE_MS);
        } else {
          setStatusWithFade(id, "saved");
        }
      } catch (err) {
        clearTimer(savingDelayTimerRef, id);
        dispatch({
          type: "setStatus",
          id,
          status: "error",
          message: err.message,
        });
      } finally {
        inflightRef.current[id] = false;
      }
    },
    [setStatusWithFade],
  );

  const scheduleCommit = useCallback(
    (id) => {
      clearTimer(debounceTimerRef, id);
      debounceTimerRef.current[id] = setTimeout(() => {
        debounceTimerRef.current[id] = null;
        performCommit(id);
      }, SAVE_DEBOUNCE_MS);
    },
    [performCommit],
  );

  const setField = useCallback(
    (id, field, value) => {
      const existing = localByIdRef.current[id];
      if (!existing) return;
      const next = { ...existing, [field]: value };
      localByIdRef.current[id] = next;
      const synced = syncedRef.current[id];
      const dirty = isDirty(next, synced);
      dispatch({
        type: "patchField",
        id,
        field,
        value,
        status: dirty ? "dirty" : "idle",
      });
      if (dirty) {
        scheduleCommit(id);
      } else {
        clearTimer(debounceTimerRef, id);
      }
    },
    [scheduleCommit],
  );

  const flushNow = useCallback(
    (id) => {
      clearTimer(debounceTimerRef, id);
      return performCommit(id);
    },
    [performCommit],
  );

  // Initial load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      dispatch({ type: "loadStart" });
      try {
        const list = await apiList();
        if (cancelled) return;
        const normalized = list.map(noteFromServer);
        for (const note of normalized) {
          syncedRef.current[note.id] = { ...note };
          localByIdRef.current[note.id] = { ...note };
        }
        dispatch({ type: "loadSuccess", notes: normalized });
      } catch (err) {
        if (!cancelled) dispatch({ type: "loadError", message: err.message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Cleanup on unmount: clear all timers, fire-and-forget any dirty saves.
  useEffect(
    () => () => {
      for (const bucket of [
        debounceTimerRef,
        savingDelayTimerRef,
        savedFadeTimerRef,
      ]) {
        for (const id of Object.keys(bucket.current)) {
          if (bucket.current[id]) clearTimeout(bucket.current[id]);
        }
      }
      for (const id of Object.keys(localByIdRef.current)) {
        const local = localByIdRef.current[id];
        const synced = syncedRef.current[id];
        if (local && isDirty(local, synced)) {
          apiUpdate(id, {
            title: local.title,
            body: local.body,
            tags: local.tags,
          }).catch(() => {});
        }
      }
    },
    [],
  );

  // ---- Actions exposed to UI ----

  const select = useCallback((id) => {
    dispatch({ type: "select", id });
  }, []);

  const create = useCallback(async () => {
    try {
      const created = await apiCreate({
        title: "Untitled",
        body: "",
        tags: [],
      });
      const note = noteFromServer(created);
      syncedRef.current[note.id] = { ...note };
      localByIdRef.current[note.id] = { ...note };
      dispatch({ type: "noteCreated", note });
      return note;
    } catch (err) {
      dispatch({ type: "globalError", message: err.message });
      return null;
    }
  }, []);

  const remove = useCallback(
    async (id) => {
      const note = stateRef.current.byId[id];
      if (!note) return false;
      const confirmed = window.confirm(
        `Delete "${note.title || "Untitled"}"? This cannot be undone.`,
      );
      if (!confirmed) return false;
      clearTimer(debounceTimerRef, id);
      clearTimer(savingDelayTimerRef, id);
      clearTimer(savedFadeTimerRef, id);
      try {
        await apiDelete(id);
        delete syncedRef.current[id];
        delete localByIdRef.current[id];
        dispatch({ type: "noteDeleted", id });
        return true;
      } catch (err) {
        dispatch({ type: "globalError", message: err.message });
        return false;
      }
    },
    [],
  );

  const retry = useCallback(
    (id) => {
      performCommit(id);
    },
    [performCommit],
  );

  const dismissError = useCallback(() => {
    dispatch({ type: "globalError", message: null });
  }, []);

  return {
    state,
    actions: {
      select,
      create,
      remove,
      retry,
      setField,
      flushNow,
      dismissError,
    },
  };
};
