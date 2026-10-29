import ActionsPanel from "./ActionsPanel";
import EnvironmentPanel from "./EnvironmentPanel";
import HealthPanel from "./HealthPanel";
import ProficienciesPanel from "./ProficienciesPanel";
import SpellcastingPanel from "./SpellcastingPanel";
import "./overview.scss";

const OverviewPage = () => {
  return (
    <section className="page overview-page">
      <div className="overview-grid">
        <div className="overview-left-stack">
          <HealthPanel />
          <ProficienciesPanel />
          <SpellcastingPanel />
        </div>

        <div className="overview-right-stack">
          <EnvironmentPanel />
          <ActionsPanel />
        </div>
      </div>
    </section>
  );
};

export default OverviewPage;
