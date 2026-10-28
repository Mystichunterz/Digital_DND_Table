import { useMemo, useState } from "react";
import Gold_Star_Icon from "@/assets/layout/left_display/Gold_Star_Icon.png";
import AutoGrowTextarea from "./AutoGrowTextarea";
import {
  attunementSlots as defaultAttunementSlots,
  coinsData as defaultCoinsData,
  languagesData as defaultLanguagesData,
  personaData as defaultPersonaData,
} from "@/data/character/background";
import { characterStateUrl } from "@/api/characterState";
import { usePersistedDebounce } from "@/state/usePersistedDebounce";
import { useCharacterStateHydration } from "@/state/useCharacterStateHydration";

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
      if (
        entry &&
        typeof entry === "object" &&
        typeof entry.code === "string"
      ) {
        incomingByCode.set(entry.code, entry);
      }
    }
  }
  return defaultCoinsData.map((coin) => {
    const match = incomingByCode.get(coin.code);
    const value = match
      ? Math.max(parseNumberInput(match.value), 0)
      : coin.value;
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

const IdentityPanel = () => {
  const [inspiration, setInspiration] = useState(false);
  const [persona, setPersona] = useState(() =>
    sanitizePersona(defaultPersonaData),
  );
  const [languages, setLanguages] = useState(() => [...defaultLanguagesData]);
  const [coins, setCoins] = useState(() => sanitizeCoins(defaultCoinsData));
  const [attunements, setAttunements] = useState(() =>
    sanitizeAttunements(defaultAttunementSlots),
  );
  const isHydrated = useCharacterStateHydration((saved) => {
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
  });

  usePersistedDebounce({
    enabled: isHydrated,
    url: characterStateUrl(),
    body: { background: { inspiration } },
  });

  usePersistedDebounce({
    enabled: isHydrated,
    url: characterStateUrl(),
    body: { identity: { persona, languages, coins, attunements } },
  });

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
      prev.map((slot, i) => (i === index ? { ...slot, item: raw } : slot)),
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
    <article className="panel identity-panel">
      <header className="panel-header identity-header">
        <h2>Identity</h2>
        <button
          type="button"
          className={
            inspiration ? "inspiration-toggle is-active" : "inspiration-toggle"
          }
          aria-pressed={inspiration}
          onClick={() => setInspiration((value) => !value)}
        >
          <img src={Gold_Star_Icon} alt="" aria-hidden="true" />
          <span>Inspiration</span>
        </button>
      </header>

      <dl className="persona-grid">
        {personaRows.map((row) => (
          <div className="persona-row" key={row.key}>
            <dt>
              <label htmlFor={`persona-${row.key}`}>{row.label}</label>
            </dt>
            <dd>
              <input
                id={`persona-${row.key}`}
                className="persona-input"
                type="text"
                value={persona[row.key] ?? ""}
                onChange={handlePersonaChange(row.key)}
              />
            </dd>
          </div>
        ))}
        <div className="persona-row">
          <dt>
            <label htmlFor="persona-xp">Experience</label>
          </dt>
          <dd className="persona-xp">
            <input
              id="persona-xp"
              className="persona-input is-number"
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
        className="persona-mark persona-mark-input"
        value={persona.distinguishingMark ?? ""}
        onChange={handleMarkChange}
        placeholder="Distinguishing mark…"
      />

      <section className="identity-section">
        <h3>Languages</h3>
        <ul className="languages-list">
          {languages.map((language, index) => (
            <li key={index}>
              <input
                className="language-input"
                type="text"
                value={language}
                onChange={handleLanguageChange(index)}
                onBlur={handleLanguageBlur(index)}
                size={Math.max(language.length, 4)}
                aria-label={`Language ${index + 1}`}
              />
              <button
                type="button"
                className="language-remove"
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
              className="language-add"
              onClick={handleAddLanguage}
            >
              + Add
            </button>
          </li>
        </ul>
      </section>

      <section className="identity-section">
        <h3>Coins</h3>
        <table className="coins-table">
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
                    className="coin-input"
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

      <section className="identity-section">
        <h3>
          Attunements
          <span className="attunements-count">
            {filledAttunements}/{attunements.length}
          </span>
        </h3>
        <ul className="attunements-list">
          {attunements.map((slot, index) => (
            <li
              key={slot.id}
              className={
                slot.item
                  ? "attunement-slot is-filled"
                  : "attunement-slot is-empty"
              }
            >
              <input
                className="attunement-input"
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

export default IdentityPanel;
