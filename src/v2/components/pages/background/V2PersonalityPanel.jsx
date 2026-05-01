import { useEffect, useState } from "react";
import AutoGrowTextarea from "./AutoGrowTextarea";
import { personalityData as defaultPersonalityData } from "../../../data/backgroundData";

const PERSISTED_CHARACTER_ID = "default";
const PERSIST_DEBOUNCE_MS = 500;

const cloneDefaults = () =>
  defaultPersonalityData.map((group) => ({
    key: group.key,
    label: group.label,
    items: [...group.items],
    note: group.note ?? "",
  }));

const sanitizePersonality = (incoming) => {
  if (!Array.isArray(incoming)) {
    return cloneDefaults();
  }
  const incomingByKey = new Map();
  for (const entry of incoming) {
    if (entry && typeof entry === "object" && typeof entry.key === "string") {
      incomingByKey.set(entry.key, entry);
    }
  }
  return defaultPersonalityData.map((group) => {
    const match = incomingByKey.get(group.key);
    if (!match) {
      return {
        key: group.key,
        label: group.label,
        items: [...group.items],
        note: group.note ?? "",
      };
    }
    const items = Array.isArray(match.items)
      ? match.items.filter((value) => typeof value === "string")
      : [...group.items];
    const note = typeof match.note === "string" ? match.note : group.note ?? "";
    return { key: group.key, label: group.label, items, note };
  });
};

const V2PersonalityPanel = () => {
  const [groups, setGroups] = useState(() => cloneDefaults());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const hydrate = async () => {
      try {
        const response = await fetch(`/api/state/${PERSISTED_CHARACTER_ID}`);

        if (isCancelled || !response.ok) {
          return;
        }

        const saved = await response.json();

        if (isCancelled || !saved || typeof saved !== "object") {
          return;
        }

        if (saved.personality !== undefined) {
          setGroups(sanitizePersonality(saved.personality));
        }
      } catch {
        // Server unavailable — keep defaults.
      } finally {
        if (!isCancelled) {
          setIsHydrated(true);
        }
      }
    };

    hydrate();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      fetch(`/api/state/${PERSISTED_CHARACTER_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personality: groups }),
      }).catch(() => {});
    }, PERSIST_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isHydrated, groups]);

  const handleItemChange = (groupKey, index) => (event) => {
    const value = event.target.value;
    setGroups((prev) =>
      prev.map((group) => {
        if (group.key !== groupKey) return group;
        const items = group.items.map((item, i) => (i === index ? value : item));
        return { ...group, items };
      }),
    );
  };

  const handleItemBlur = (groupKey, index) => () => {
    setGroups((prev) =>
      prev.map((group) => {
        if (group.key !== groupKey) return group;
        const current = group.items[index];
        if (typeof current === "string" && current.trim() !== "") {
          return group;
        }
        return { ...group, items: group.items.filter((_, i) => i !== index) };
      }),
    );
  };

  const handleAddItem = (groupKey) => () => {
    setGroups((prev) =>
      prev.map((group) =>
        group.key === groupKey
          ? { ...group, items: [...group.items, "New entry"] }
          : group,
      ),
    );
  };

  const handleRemoveItem = (groupKey, index) => () => {
    setGroups((prev) =>
      prev.map((group) =>
        group.key === groupKey
          ? { ...group, items: group.items.filter((_, i) => i !== index) }
          : group,
      ),
    );
  };

  const handleNoteChange = (groupKey) => (event) => {
    const value = event.target.value;
    setGroups((prev) =>
      prev.map((group) =>
        group.key === groupKey ? { ...group, note: value } : group,
      ),
    );
  };

  return (
    <article className="v2-overview-panel v2-background-panel v2-personality-panel">
      <header className="v2-overview-panel-header">
        <h2>Personality</h2>
      </header>

      <div className="v2-personality-grid">
        {groups.map((group) => (
          <section key={group.key} className="v2-personality-card">
            <h3>{group.label}</h3>
            <ul>
              {group.items.map((item, index) => (
                <li key={index}>
                  <AutoGrowTextarea
                    className="v2-personality-item-input"
                    value={item}
                    onChange={handleItemChange(group.key, index)}
                    onBlur={handleItemBlur(group.key, index)}
                    aria-label={`${group.label} entry ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="v2-personality-item-remove"
                    onClick={handleRemoveItem(group.key, index)}
                    aria-label={`Remove ${group.label} entry ${index + 1}`}
                  >
                    ×
                  </button>
                </li>
              ))}
              <li className="v2-personality-add-row">
                <button
                  type="button"
                  className="v2-personality-add"
                  onClick={handleAddItem(group.key)}
                >
                  + Add
                </button>
              </li>
            </ul>
            <input
              className="v2-personality-note v2-personality-note-input"
              type="text"
              value={group.note ?? ""}
              onChange={handleNoteChange(group.key)}
              placeholder="Note (optional)"
              aria-label={`${group.label} note`}
            />
          </section>
        ))}
      </div>
    </article>
  );
};

export default V2PersonalityPanel;
