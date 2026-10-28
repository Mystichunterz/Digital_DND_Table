import IdentityPanel from "./IdentityPanel";
import PersonalityPanel from "./PersonalityPanel";
import BackstoryPanel from "./BackstoryPanel";
import MoodboardPanel from "./MoodboardPanel";
import "./background.scss";

const BackgroundPage = () => {
  return (
    <section className="page background-page">
      <div className="background-grid">
        <div className="background-info-stack">
          <IdentityPanel />
          <PersonalityPanel />
          <BackstoryPanel />
        </div>

        <MoodboardPanel />
      </div>
    </section>
  );
};

export default BackgroundPage;
