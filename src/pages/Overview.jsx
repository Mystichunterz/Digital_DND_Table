//----------------------
//  imports
//----------------------
import "../styles/pages/overview.scss";
import HealthContainer from "../components/pages/overview/HealthContainer";

//----------------------
//  main
//----------------------
const Overview = () => {
  return (
    <div className="overview-container">
      <div className="overview-left-container">
        <HealthContainer />
        <div className="skill-container">
          <p>Skills</p>
        </div>
        <div className="spellcasting-modifier-container">
          <p>Spellcasting Modifiers</p>
        </div>
      </div>
      <div className="overview-right-container">
        <div className="environment-container">
          <p>Environment</p>
        </div>
        <div className="action-container">
          <p>Actions</p>
        </div>
      </div>
    </div>
  );
};

//----------------------
//  exports
//----------------------
export default Overview;
