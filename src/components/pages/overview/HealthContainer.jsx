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
  const [inputValue, setInputValue] = useState(0);

  const handleHealthChange = (e) => {
    const value = parseInt(e.target.innerText) || 0;
    setHealth(value);
  };

  const handleMaxHealthChange = (e) => {
    const value = parseInt(e.target.innerText) || 0;
    setMaxHealth(value);
  };

  const handleTempHealthChange = (e) => {
    const value = parseInt(e.target.innerText) || 0;
    setTempHealth(value);
  };

  const handleInputChange = (e) => {
    setInputValue(parseInt(e.target.value) || 0);
  };

  return (
    <div className="health-container">
      <div className="health-actions">
        <button onClick={() => setHealth((prev) => Math.min(prev + inputValue, maxHealth))} className="heal-button">
          Heal
        </button>
        <input type="number" placeholder="Enter HP" value={inputValue} onChange={handleInputChange} />
        <button onClick={() => setHealth((prev) => Math.max(prev - inputValue, 0))} className="damage-button">
          Damage
        </button>
      </div>

      {/* Middle section: Current/Max Health */}
      <div className="health-info">
        <p className="label">Current&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Max</p>
        <p className="value">
          <span contentEditable suppressContentEditableWarning onBlur={handleHealthChange} className="editable">
            {health}
          </span>
          &nbsp;/&nbsp;
          <span contentEditable suppressContentEditableWarning onBlur={handleMaxHealthChange} className="editable">
            {maxHealth}
          </span>
        </p>
        <p className="label">Hit Points</p>
      </div>

      {/* Right section: Temp HP */}
      <div className="health-temp">
        <p className="label">Temp</p>
        <p className="value editable" contentEditable suppressContentEditableWarning onBlur={handleTempHealthChange}>
          {tempHealth || "-"}
        </p>
        <p className="label">&nbsp;</p>
      </div>
    </div>
  );
};

//----------------------
//  exports
//----------------------
export default HealthContainer;
