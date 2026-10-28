import CompanionsPanel from "./CompanionsPanel";
// Shares the page/panel layout rules with Background.
import "@/features/background/background.scss";
import "./companions.scss";

const CompanionsPage = () => {
  return (
    <section className="page background-page">
      <div className="companions-page-grid">
        <CompanionsPanel />
      </div>
    </section>
  );
};

export default CompanionsPage;
