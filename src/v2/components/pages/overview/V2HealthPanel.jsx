import { useMemo, useState } from "react";

const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

const parseNumberInput = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const V2HealthPanel = () => {
  const [currentHp, setCurrentHp] = useState(50);
  const [maxHp, setMaxHp] = useState(50);
  const [tempHp, setTempHp] = useState(0);
  const [adjustment, setAdjustment] = useState(8);

  const adjustedCurrentHp = useMemo(
    () => clampValue(currentHp, 0, maxHp),
    [currentHp, maxHp],
  );

  const handleHeal = () => {
    setCurrentHp((prev) => clampValue(prev + adjustment, 0, maxHp));
  };

  const handleDamage = () => {
    setCurrentHp((prev) => clampValue(prev - adjustment, 0, maxHp));
  };

  const handleCurrentHpChange = (event) => {
    setCurrentHp(clampValue(parseNumberInput(event.target.value), 0, maxHp));
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

  return (
    <article className="v2-overview-panel v2-health-panel">
      <header className="v2-overview-panel-header">
        <h2>Health</h2>
      </header>

      <div className="v2-health-summary">
        <div className="v2-health-chip">
          <span className="v2-label">Current</span>
          <input
            type="number"
            value={adjustedCurrentHp}
            onChange={handleCurrentHpChange}
            className="v2-health-value-input"
            aria-label="Current hit points"
          />
        </div>

        <div className="v2-health-chip">
          <span className="v2-label">Max</span>
          <input
            type="number"
            value={maxHp}
            onChange={handleMaxHpChange}
            className="v2-health-value-input"
            aria-label="Maximum hit points"
          />
        </div>

        <div className="v2-health-chip">
          <span className="v2-label">Temp</span>
          <input
            type="number"
            value={tempHp}
            onChange={handleTempHpChange}
            className="v2-health-value-input"
            aria-label="Temporary hit points"
          />
        </div>
      </div>

      <div className="v2-health-actions">
        <label className="v2-adjustment-field" htmlFor="v2-health-adjustment">
          <span className="v2-label">Adjustment</span>
          <input
            id="v2-health-adjustment"
            type="number"
            value={adjustment}
            onChange={handleAdjustmentChange}
            min="0"
            aria-label="Health adjustment amount"
          />
        </label>

        <button
          type="button"
          className="v2-health-button v2-health-heal"
          onClick={handleHeal}
        >
          Heal
        </button>
        <button
          type="button"
          className="v2-health-button v2-health-damage"
          onClick={handleDamage}
        >
          Damage
        </button>
      </div>
    </article>
  );
};

export default V2HealthPanel;
