//----------------------
//  imports
//----------------------
import "../styles/pages/overview.scss";
import HealthContainer from "../components/pages/overview/HealthContainer";
import SkillsContainer from "../components/pages/overview/SkillsContainer";
import SpellcastingModifierContainer from "../components/pages/overview/SpellcastingModifierContainer.jsx";

import EnvironmentContainer from "../components/pages/overview/EnvironmentContainer.jsx";

//----------------------
//  main
//----------------------
const Overview = () => {
  return (
    <div className="overview-container">
      <div className="overview-left-container">
        <HealthContainer />
        <SkillsContainer />
        <SpellcastingModifierContainer />
      </div>
      <div className="overview-right-container">
        <EnvironmentContainer />
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
