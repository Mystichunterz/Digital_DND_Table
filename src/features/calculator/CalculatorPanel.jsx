import { useCallback, useMemo, useRef, useState } from "react";
import { useCharacterStats } from "@/state/CharacterStatsContext";
import { TOKEN_LABELS, formulaRange, substituteTokens } from "@/lib/formulas";

const HISTORY_LIMIT = 8;
const TOKEN_KEYS = [
  "STR",
  "DEX",
  "CON",
  "INT",
  "WIS",
  "CHA",
  "PROF",
  "SPELL_ATK",
  "SPELL_DC",
];

const QUICK_DICE = [
  "1d4",
  "1d6",
  "1d8",
  "1d10",
  "1d12",
  "1d20",
  "2d6",
  "1d100",
];

const buildCommand = (expression) => {
  const trimmed = expression.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.startsWith("!") ? trimmed : `!roll ${trimmed}`;
};

const CalculatorPanel = () => {
  const [expression, setExpression] = useState("1d20+{PROF}+{STR}");
  const [history, setHistory] = useState([]);
  const [copyStatus, setCopyStatus] = useState("idle");
  const inputRef = useRef(null);
  const { tokenValues } = useCharacterStats();

  const resolved = useMemo(
    () => substituteTokens(expression, tokenValues),
    [expression, tokenValues],
  );

  const command = useMemo(() => buildCommand(resolved), [resolved]);

  const range = useMemo(() => formulaRange(resolved), [resolved]);

  const insertAtCursor = useCallback((text) => {
    const input = inputRef.current;
    if (!input) {
      setExpression((current) => `${current}${text}`);
      return;
    }

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;

    setExpression((current) => {
      const before = current.slice(0, start);
      const after = current.slice(end);
      return `${before}${text}${after}`;
    });

    requestAnimationFrame(() => {
      input.focus();
      const cursor = start + text.length;
      input.setSelectionRange(cursor, cursor);
    });
  }, []);

  const handleCopy = useCallback(async () => {
    if (!command) {
      return;
    }

    try {
      await navigator.clipboard.writeText(command);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }

    setHistory((current) => {
      if (current[0] === command) {
        return current;
      }
      return [command, ...current].slice(0, HISTORY_LIMIT);
    });

    setTimeout(() => setCopyStatus("idle"), 1400);
  }, [command]);

  const handleClear = useCallback(() => {
    setExpression("");
    inputRef.current?.focus();
  }, []);

  const handleHistoryReplay = useCallback((entry) => {
    const stripped = entry.startsWith("!roll ") ? entry.slice(6) : entry;
    setExpression(stripped);
  }, []);

  return (
    <article className="overview-panel calculator-panel">
      <header className="overview-panel-header">
        <h2>Calculator</h2>
        <p className="calculator-subtitle">
          Build an Avrae <code>!roll</code> command. Tokens substitute from your
          live ability modifiers; copy the result into Discord.
        </p>
      </header>

      <div className="calculator-body">
        <label className="calculator-input-row">
          <span className="calculator-label">Expression</span>
          <input
            ref={inputRef}
            type="text"
            spellCheck={false}
            value={expression}
            onChange={(event) => setExpression(event.target.value)}
            placeholder="1d20+{PROF}+{STR}"
            className="calculator-input"
          />
        </label>

        <div className="calculator-chips" aria-label="Quick dice">
          <span className="calculator-chip-group-label">Dice</span>
          {QUICK_DICE.map((die) => (
            <button
              key={die}
              type="button"
              className="calculator-chip"
              onClick={() => insertAtCursor(die)}
            >
              {die}
            </button>
          ))}
        </div>

        <div className="calculator-chips" aria-label="Tokens">
          <span className="calculator-chip-group-label">Tokens</span>
          {TOKEN_KEYS.map((key) => {
            const value = tokenValues?.[key];
            return (
              <button
                key={key}
                type="button"
                className="calculator-chip calculator-chip-token"
                onClick={() => insertAtCursor(`{${key}}`)}
                title={TOKEN_LABELS[key] ?? key}
              >
                <span>{key}</span>
                {value !== undefined && (
                  <span className="calculator-chip-value">{value}</span>
                )}
              </button>
            );
          })}
        </div>

        <output
          className="calculator-output"
          aria-live="polite"
          aria-label="Resolved command"
        >
          <span className="calculator-output-label">Command</span>
          <code className="calculator-output-command">{command || "—"}</code>
          {command && (
            <span className="calculator-output-range" title="Min–max range">
              {range.min}–{range.max}
            </span>
          )}
        </output>

        <div className="calculator-actions">
          <button
            type="button"
            className="calculator-action"
            onClick={handleCopy}
            disabled={!command}
          >
            {copyStatus === "copied"
              ? "Copied!"
              : copyStatus === "error"
                ? "Copy failed"
                : "Copy command"}
          </button>
          <button
            type="button"
            className="calculator-action is-secondary"
            onClick={handleClear}
            disabled={!expression}
          >
            Clear
          </button>
        </div>

        <section className="calculator-history" aria-label="Recent commands">
          <h3>Recent</h3>
          {history.length === 0 ? (
            <p className="calculator-history-empty">
              Copied commands appear here.
            </p>
          ) : (
            <ol className="calculator-history-list">
              {history.map((entry, index) => (
                <li key={`${entry}-${index}`}>
                  <button
                    type="button"
                    className="calculator-history-entry"
                    onClick={() => handleHistoryReplay(entry)}
                    title="Click to load into the editor"
                  >
                    <code>{entry}</code>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </article>
  );
};

export default CalculatorPanel;
