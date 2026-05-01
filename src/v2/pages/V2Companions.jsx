import V2CompanionsPanel from "../components/pages/background/V2CompanionsPanel";
import "../styles/pages/v2-background.scss";

const V2Companions = () => {
  return (
    <section className="v2-page v2-background-page">
      <div className="v2-companions-page-grid">
        <V2CompanionsPanel />
      </div>
    </section>
  );
};

export default V2Companions;
