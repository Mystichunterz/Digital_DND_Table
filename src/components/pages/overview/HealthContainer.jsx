//----------------------
//  imports
//----------------------
import "../../../styles/components/pages/overview/health-container.scss";
import { useState } from "react";

//----------------------
//  main
//----------------------
const HealthContainer = () => {
  const [health, setHealth] = useState(50);
  const [maxHealth, setMaxHealth] = useState(50);
  const [tempHealth, setTempHealth] = useState(0);
  const [inputValue, setInputValue] = useState("");

  const handleHeal = () => {
    const healAmount = parseInt(inputValue) || 0;
    setHealth((prev) => Math.min(prev + healAmount, maxHealth));
    setInputValue("");
  };

  const handleDamage = () => {
    const damageAmount = parseInt(inputValue) || 0;
    setHealth((prev) => Math.max(prev - damageAmount, 0));
    setInputValue("");
  };

  return (
    <div className="health-container">
      {/* Left section: Heal Button, Input, Damage Button */}
      <div className="health-actions">
        <button onClick={handleHeal} className="heal-button">
          Heal
        </button>
        <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Enter HP" />
        <button onClick={handleDamage} className="damage-button">
          Damage
        </button>
      </div>

      {/* Middle section: Current/Max Health */}
      <div className="health-info">
        <p className="label">Current&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Max</p>
        <p className="value">
          {health} / {maxHealth}
        </p>
        <p className="label">Hit Points</p>
      </div>

      {/* Right section: Temp HP */}
      <div className="health-temp">
        <p className="label">Temp</p>
        <p className="value">{tempHealth || "--"}</p>
        <p className="label">&nbsp;</p>
      </div>
    </div>
  );
};

//----------------------
//  exports
//----------------------
export default HealthContainer;
