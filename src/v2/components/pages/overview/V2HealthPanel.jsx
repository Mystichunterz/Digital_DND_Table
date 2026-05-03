import { useEffect, useMemo, useState } from "react";
import { usePersistedDebounce } from "../../../state/usePersistedDebounce";

const PERSISTED_CHARACTER_ID = "default";

const DEFAULT_HEALTH = {
  currentHp: 61,
  maxHp: 61,
  tempHp: 0,
  adjustment: 8,
  deathSaves: { successes: 0, failures: 0 },
};

const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

const parseNumberInput = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const sanitizeHealth = (incoming) => {
  if (!incoming || typeof incoming !== "object") {
    return { ...DEFAULT_HEALTH, deathSaves: { ...DEFAULT_HEALTH.deathSaves } };
  }

  const maxHp = Math.max(parseNumberInput(incoming.maxHp), 1);
  const currentHp = clampValue(parseNumberInput(incoming.currentHp), 0, maxHp);
  const tempHp = Math.max(parseNumberInput(incoming.tempHp), 0);
  const adjustment = Math.max(parseNumberInput(incoming.adjustment), 0);
  const incomingSaves = incoming.deathSaves ?? {};
  const successes = clampValue(parseNumberInput(incomingSaves.successes), 0, 3);
  const failures = clampValue(parseNumberInput(incomingSaves.failures), 0, 3);

  return {
    currentHp,
    maxHp,
    tempHp,
    adjustment,
    deathSaves: { successes, failures },
  };
};

const getHealthTone = (ratio) => {
  if (ratio <= 0) return "down";
  if (ratio < 0.25) return "critical";
  if (ratio < 0.55) return "wounded";
  return "healthy";
};

const V2HealthPanel = () => {
  const [currentHp, setCurrentHp] = useState(DEFAULT_HEALTH.currentHp);
  const [maxHp, setMaxHp] = useState(DEFAULT_HEALTH.maxHp);
  const [tempHp, setTempHp] = useState(DEFAULT_HEALTH.tempHp);
  const [adjustment, setAdjustment] = useState(DEFAULT_HEALTH.adjustment);
  const [deathSaves, setDeathSaves] = useState(() => ({
    ...DEFAULT_HEALTH.deathSaves,
  }));
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

        const health = sanitizeHealth(saved.health);

        setCurrentHp(health.currentHp);
        setMaxHp(health.maxHp);
        setTempHp(health.tempHp);
        setAdjustment(health.adjustment);
        setDeathSaves(health.deathSaves);
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

  usePersistedDebounce({
    enabled: isHydrated,
    url: `/api/state/${PERSISTED_CHARACTER_ID}`,
    body: {
      health: { currentHp, maxHp, tempHp, adjustment, deathSaves },
    },
  });

  const adjustedCurrentHp = useMemo(
    () => clampValue(currentHp, 0, maxHp),
    [currentHp, maxHp],
  );

  const hpRatio = maxHp > 0 ? adjustedCurrentHp / maxHp : 0;
  const tempRatio = maxHp > 0 ? Math.min(tempHp / maxHp, 1) : 0;
  const tone = getHealthTone(hpRatio);
  const isDowned = adjustedCurrentHp === 0;
  const isStabilized = isDowned && deathSaves.successes >= 3;
  const isDead = isDowned && deathSaves.failures >= 3;

  const status = isDead
    ? "dead"
    : isStabilized
      ? "stabilized"
      : isDowned
        ? "downed"
        : "alive";

  const applyDamage = (amount) => {
    if (amount <= 0) return;
    const tempAbsorbed = Math.min(tempHp, amount);
    const remainingDamage = amount - tempAbsorbed;
    setTempHp((prev) => Math.max(prev - tempAbsorbed, 0));
    setCurrentHp((prev) => clampValue(prev - remainingDamage, 0, maxHp));
  };

  const applyHeal = (amount) => {
    if (amount <= 0) return;
    setCurrentHp((prev) => {
      const next = clampValue(prev + amount, 0, maxHp);
      if (prev === 0 && next > 0) {
        setDeathSaves({ successes: 0, failures: 0 });
      }
      return next;
    });
  };

  const handleHeal = () => applyHeal(adjustment);
  const handleDamage = () => applyDamage(adjustment);

  const handleCurrentHpChange = (event) => {
    const next = clampValue(parseNumberInput(event.target.value), 0, maxHp);
    setCurrentHp(next);
    if (next > 0) {
      setDeathSaves({ successes: 0, failures: 0 });
    }
  };

  const handleMaxHpChange = (event) => {
    const nextMaxHp = Math.max(parseNumberInput(event.target.value), 1);
    setMaxHp(nextMaxHp);
    setCurrentHp((prev) => clampValue(prev, 0, nextMaxHp));
  };

  const handleTempHpChange = (event) => {
    setTempHp(Math.max(parseNumberInput(event.target.value), 0));
  };

  const handleAdjustmentChange = (event) => {
    setAdjustment(Math.max(parseNumberInput(event.target.value), 0));
  };

  const setSaveCount = (kind, count) => {
    setDeathSaves((prev) => {
      const next = clampValue(count, 0, 3);
      if (prev[kind] === next) {
        return prev;
      }
      return { ...prev, [kind]: next };
    });
  };

  const togglePip = (kind, index) => {
    const filledCount = deathSaves[kind];
    const next = index + 1 === filledCount ? index : index + 1;
    setSaveCount(kind, next);
  };

  const resetDeathSaves = () => {
    setDeathSaves({ successes: 0, failures: 0 });
  };

  const renderPipRow = (kind, label) => {
    const filled = deathSaves[kind];

    return (
      <div className={`v2-death-save-row v2-death-save-row-${kind}`}>
        <span className="v2-death-save-label">{label}</span>
        <div
          className="v2-death-save-pips"
          role="group"
          aria-label={`${label}: ${filled} of 3`}
        >
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              type="button"
              className={
                index < filled
                  ? `v2-death-save-pip is-filled is-${kind}`
                  : `v2-death-save-pip is-${kind}`
              }
              aria-pressed={index < filled}
              aria-label={`${label} ${index + 1}`}
              onClick={() => togglePip(kind, index)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <article
      className={`v2-overview-panel v2-health-panel is-${status} tone-${tone}`}
    >
      <header className="v2-overview-panel-header v2-health-panel-header">
        <h2>Health</h2>
        {status !== "alive" && (
          <span className={`v2-health-status-badge is-${status}`}>
            {status === "dead"
              ? "Dead"
              : status === "stabilized"
                ? "Stable"
                : "Downed"}
          </span>
        )}
      </header>

      <div className="v2-health-bar-wrap" aria-hidden="true">
        <div className={`v2-health-bar tone-${tone}`}>
          <div
            className="v2-health-bar-fill"
            style={{ width: `${hpRatio * 100}%` }}
          />
          {tempRatio > 0 && (
            <div
              className="v2-health-bar-temp"
              style={{ width: `${tempRatio * 100}%` }}
            />
          )}
        </div>
        <div className="v2-health-bar-readout">
          <span className="v2-health-bar-current">{adjustedCurrentHp}</span>
          <span className="v2-health-bar-divider">/</span>
          <span className="v2-health-bar-max">{maxHp}</span>
          {tempHp > 0 && (
            <span className="v2-health-bar-temp-readout">+{tempHp}</span>
          )}
        </div>
      </div>

      <div className="v2-health-stats">
        <label className="v2-health-stat">
          <span className="v2-health-stat-label">HP</span>
          <input
            type="number"
            value={adjustedCurrentHp}
            onChange={handleCurrentHpChange}
            className="v2-health-stat-input"
            aria-label="Current hit points"
          />
        </label>

        <label className="v2-health-stat">
          <span className="v2-health-stat-label">Max</span>
          <input
            type="number"
            value={maxHp}
            onChange={handleMaxHpChange}
            className="v2-health-stat-input"
            aria-label="Maximum hit points"
          />
        </label>

        <label className="v2-health-stat is-temp">
          <span className="v2-health-stat-label">Temp</span>
          <input
            type="number"
            value={tempHp}
            onChange={handleTempHpChange}
            className="v2-health-stat-input"
            aria-label="Temporary hit points"
          />
        </label>
      </div>

      <div className="v2-health-stepper" role="group" aria-label="Adjust HP">
        <button
          type="button"
          className="v2-health-stepper-button is-damage"
          onClick={handleDamage}
          aria-label={`Damage ${adjustment}`}
        >
          <span className="v2-health-stepper-symbol" aria-hidden="true">
            −
          </span>
          <span className="v2-health-stepper-text">Damage</span>
        </button>
        <input
          id="v2-health-adjustment"
          type="number"
          value={adjustment}
          onChange={handleAdjustmentChange}
          min="0"
          className="v2-health-stepper-amount"
          aria-label="Adjustment amount"
        />
        <button
          type="button"
          className="v2-health-stepper-button is-heal"
          onClick={handleHeal}
          aria-label={`Heal ${adjustment}`}
        >
          <span className="v2-health-stepper-text">Heal</span>
          <span className="v2-health-stepper-symbol" aria-hidden="true">
            +
          </span>
        </button>
      </div>

      {isDowned && (
        <section
          className={`v2-death-saves is-${status}`}
          aria-label="Death saving throws"
        >
          <header className="v2-death-saves-header">
            <span className="v2-death-saves-title">
              {status === "dead"
                ? "Dead"
                : status === "stabilized"
                  ? "Stabilized"
                  : "Death Saving Throws"}
            </span>
            <button
              type="button"
              className="v2-death-saves-reset"
              onClick={resetDeathSaves}
            >
              Reset
            </button>
          </header>
          {renderPipRow("successes", "Successes")}
          {renderPipRow("failures", "Failures")}
        </section>
      )}
    </article>
  );
};

export default V2HealthPanel;
