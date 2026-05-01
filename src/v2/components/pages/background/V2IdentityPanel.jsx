import { useEffect, useMemo, useState } from "react";
import Gold_Star_Icon from "../../../../assets/layout/left_display/Gold_Star_Icon.png";
import AutoGrowTextarea from "./AutoGrowTextarea";
import {
  attunementSlots as defaultAttunementSlots,
  coinsData as defaultCoinsData,
  languagesData as defaultLanguagesData,
  personaData as defaultPersonaData,
} from "../../../data/backgroundData";

const PERSISTED_CHARACTER_ID = "default";
const PERSIST_DEBOUNCE_MS = 500;

const personaRows = [
  { label: "Player", key: "playerName" },
  { label: "Alignment", key: "alignment" },
  { label: "Age", key: "age" },
  { label: "Height", key: "height" },
  { label: "Weight", key: "weight" },
  { label: "Eyes", key: "eyes" },
  { label: "Skin", key: "skin" },
  { label: "Hair", key: "hair" },
  { label: "Faith", key: "faith" },
];

const parseNumberInput = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const sanitizePersona = (incoming) => {
  const source = incoming && typeof incoming === "object" ? incoming : {};
  const next = {};
  for (const row of personaRows) {
    const value = source[row.key];
    next[row.key] =
      typeof value === "string" ? value : defaultPersonaData[row.key];
  }
  next.distinguishingMark =
    typeof source.distinguishingMark === "string"
      ? source.distinguishingMark
      : defaultPersonaData.distinguishingMark;
  next.xp = Math.max(parseNumberInput(source.xp ?? defaultPersonaData.xp), 0);
  return next;
};

const sanitizeLanguages = (incoming) => {
  if (!Array.isArray(incoming)) {
    return [...defaultLanguagesData];
  }
  return incoming
    .filter((value) => typeof value === "string")
    .map((value) => value);
};

const sanitizeCoins = (incoming) => {
  const incomingByCode = new Map();
  if (Array.isArray(incoming)) {
    for (const entry of incoming) {
      if (entry && typeof entry === "object" && typeof entry.code === "string") {
        incomingByCode.set(entry.code, entry);
      }
    }
  }
  return defaultCoinsData.map((coin) => {
    const match = incomingByCode.get(coin.code);
    const value = match ? Math.max(parseNumberInput(match.value), 0) : coin.value;
    return { ...coin, value };
  });
};

const sanitizeAttunements = (incoming) => {
  if (!Array.isArray(incoming)) {
    return defaultAttunementSlots.map((slot) => ({ ...slot }));
  }
  return defaultAttunementSlots.map((slot, index) => {
    const match = incoming[index];
    if (!match || typeof match !== "object") {
      return { ...slot };
    }
    const item =
      typeof match.item === "string" && match.item.trim() !== ""
        ? match.item
        : null;
    return { id: slot.id, item };
  });
};

const formatXp = (value) => value.toLocaleString("en-US");

const V2IdentityPanel = () => {
  const [inspiration, setInspiration] = useState(false);
  const [persona, setPersona] = useState(() => sanitizePersona(defaultPersonaData));
  const [languages, setLanguages] = useState(() => [...defaultLanguagesData]);
  const [coins, setCoins] = useState(() => sanitizeCoins(defaultCoinsData));
  const [attunements, setAttunements] = useState(() =>
    sanitizeAttunements(defaultAttunementSlots),
  );
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

        if (saved.background && typeof saved.background === "object") {
          setInspiration(Boolean(saved.background.inspiration));
        }

        const identity = saved.identity;
        if (identity && typeof identity === "object") {
          setPersona(sanitizePersona(identity.persona));
          setLanguages(sanitizeLanguages(identity.languages));
          setCoins(sanitizeCoins(identity.coins));
          setAttunements(sanitizeAttunements(identity.attunements));
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
        body: JSON.stringify({ background: { inspiration } }),
      }).catch(() => {});
    }, PERSIST_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isHydrated, inspiration]);

  useEffect(() => {
    if (!isHydrated) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      fetch(`/api/state/${PERSISTED_CHARACTER_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity: { persona, languages, coins, attunements },
        }),
      }).catch(() => {});
    }, PERSIST_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isHydrated, persona, languages, coins, attunements]);

  const filledAttunements = useMemo(
    () => attunements.filter((slot) => slot.item).length,
    [attunements],
  );

  const handlePersonaChange = (key) => (event) => {
    const value = event.target.value;
    setPersona((prev) => ({ ...prev, [key]: value }));
  };

  const handleXpChange = (event) => {
    const value = Math.max(parseNumberInput(event.target.value), 0);
    setPersona((prev) => ({ ...prev, xp: value }));
  };

  const handleMarkChange = (event) => {
    setPersona((prev) => ({ ...prev, distinguishingMark: event.target.value }));
  };

  const handleLanguageChange = (index) => (event) => {
    const value = event.target.value;
    setLanguages((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleLanguageBlur = (index) => () => {
    setLanguages((prev) => {
      if (prev[index] && prev[index].trim() !== "") {
        return prev;
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAddLanguage = () => {
    setLanguages((prev) => [...prev, "New language"]);
  };

  const handleRemoveLanguage = (index) => () => {
    setLanguages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCoinChange = (code) => (event) => {
    const value = Math.max(parseNumberInput(event.target.value), 0);
    setCoins((prev) =>
      prev.map((coin) => (coin.code === code ? { ...coin, value } : coin)),
    );
  };

  const handleAttunementChange = (index) => (event) => {
    const raw = event.target.value;
    setAttunements((prev) =>
      prev.map((slot, i) =>
        i === index ? { ...slot, item: raw } : slot,
      ),
    );
  };

  const handleAttunementBlur = (index) => () => {
    setAttunements((prev) =>
      prev.map((slot, i) => {
        if (i !== index) return slot;
        const trimmed = typeof slot.item === "string" ? slot.item.trim() : "";
        return { ...slot, item: trimmed === "" ? null : trimmed };
      }),
    );
  };

  return (
    <article className="v2-overview-panel v2-background-panel v2-identity-panel">
      <header className="v2-overview-panel-header v2-identity-header">
        <h2>Identity</h2>
        <button
          type="button"
          className={
            inspiration
              ? "v2-inspiration-toggle is-active"
              : "v2-inspiration-toggle"
          }
          aria-pressed={inspiration}
          onClick={() => setInspiration((value) => !value)}
        >
          <img src={Gold_Star_Icon} alt="" aria-hidden="true" />
          <span>Inspiration</span>
        </button>
      </header>

      <dl className="v2-persona-grid">
        {personaRows.map((row) => (
          <div className="v2-persona-row" key={row.key}>
            <dt>
              <label htmlFor={`v2-persona-${row.key}`}>{row.label}</label>
            </dt>
            <dd>
              <input
                id={`v2-persona-${row.key}`}
                className="v2-persona-input"
                type="text"
                value={persona[row.key] ?? ""}
                onChange={handlePersonaChange(row.key)}
              />
            </dd>
          </div>
        ))}
        <div className="v2-persona-row">
          <dt>
            <label htmlFor="v2-persona-xp">Experience</label>
          </dt>
          <dd className="v2-persona-xp">
            <input
              id="v2-persona-xp"
              className="v2-persona-input is-number"
              type="number"
              min="0"
              value={persona.xp}
              onChange={handleXpChange}
            />
            <span aria-hidden="true">XP</span>
            <span className="visually-hidden">
              {formatXp(persona.xp)} experience points
            </span>
          </dd>
        </div>
      </dl>

      <AutoGrowTextarea
        className="v2-persona-mark v2-persona-mark-input"
        value={persona.distinguishingMark ?? ""}
        onChange={handleMarkChange}
        placeholder="Distinguishing mark…"
      />

      <section className="v2-identity-section">
        <h3>Languages</h3>
        <ul className="v2-languages-list">
          {languages.map((language, index) => (
            <li key={index}>
              <input
                className="v2-language-input"
                type="text"
                value={language}
                onChange={handleLanguageChange(index)}
                onBlur={handleLanguageBlur(index)}
                size={Math.max(language.length, 4)}
                aria-label={`Language ${index + 1}`}
              />
              <button
                type="button"
                className="v2-language-remove"
                onClick={handleRemoveLanguage(index)}
                aria-label={`Remove ${language || "language"}`}
              >
                ×
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="v2-language-add"
              onClick={handleAddLanguage}
            >
              + Add
            </button>
          </li>
        </ul>
      </section>

      <section className="v2-identity-section">
        <h3>Coins</h3>
        <table className="v2-coins-table">
          <thead>
            <tr>
              {coins.map((coin) => (
                <th key={coin.code} scope="col" title={coin.label}>
                  {coin.code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {coins.map((coin) => (
                <td
                  key={coin.code}
                  className={`tone-${coin.code.toLowerCase()}`}
                >
                  <input
                    className="v2-coin-input"
                    type="number"
                    min="0"
                    value={coin.value}
                    onChange={handleCoinChange(coin.code)}
                    aria-label={`${coin.label} coins`}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      <section className="v2-identity-section">
        <h3>
          Attunements
          <span className="v2-attunements-count">
            {filledAttunements}/{attunements.length}
          </span>
        </h3>
        <ul className="v2-attunements-list">
          {attunements.map((slot, index) => (
            <li
              key={slot.id}
              className={
                slot.item
                  ? "v2-attunement-slot is-filled"
                  : "v2-attunement-slot is-empty"
              }
            >
              <input
                className="v2-attunement-input"
                type="text"
                value={slot.item ?? ""}
                onChange={handleAttunementChange(index)}
                onBlur={handleAttunementBlur(index)}
                placeholder="Empty Slot"
                aria-label={`Attunement slot ${index + 1}`}
              />
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
};

export default V2IdentityPanel;
