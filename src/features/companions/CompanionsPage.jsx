import CompanionsPanel from "./CompanionsPanel";
import "./companions.scss";

const CompanionsPage = () => {
  return (
    <section className="page companions-page">
      <div className="companions-page-grid">
        <CompanionsPanel />
      </div>
    </section>
  );
};

export default CompanionsPage;
