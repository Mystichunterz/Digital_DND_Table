import V2ActionsPanel from "../components/pages/overview/V2ActionsPanel";
import V2EnvironmentPanel from "../components/pages/overview/V2EnvironmentPanel";
import V2HealthPanel from "../components/pages/overview/V2HealthPanel";
import V2ProficienciesPanel from "../components/pages/overview/V2ProficienciesPanel";
import V2SpellcastingPanel from "../components/pages/overview/V2SpellcastingPanel";
import "../styles/pages/v2-overview.scss";

const V2Overview = () => {
  return (
    <section className="v2-page v2-overview-page">
      <div className="v2-overview-grid">
        <div className="v2-overview-left-stack">
          <V2HealthPanel />
          <V2ProficienciesPanel />
          <V2SpellcastingPanel />
        </div>

        <div className="v2-overview-right-stack">
          <V2EnvironmentPanel />
          <V2ActionsPanel />
        </div>
      </div>
    </section>
  );
};

export default V2Overview;
