//----------------------
//  src > pages > Overview.jsx
//----------------------

//----------------------
//  imports
//----------------------
import "../styles/pages/overview.scss";

//----------------------
//  main
//----------------------
const Overview = () => {
  return (
    <div className="overview-container">
      <div className="overview-left-container">
        <div className="health-container">Health</div>
        <div className="skill-container">Skills</div>
        <div className="saving-throw-container">Saving Throws</div>
        <div className="spellcasting-modifier-container">Spellcasting Modifiers</div>
      </div>
      <div className="overview-right-container">
        <div className="environment-container">Environment</div>
        <div className="action-container">Actions</div>
      </div>
    </div>
  );
};

//----------------------
//  exports
//----------------------
export default Overview;
