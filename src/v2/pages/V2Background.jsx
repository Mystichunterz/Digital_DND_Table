import V2IdentityPanel from "../components/pages/background/V2IdentityPanel";
import V2PersonalityPanel from "../components/pages/background/V2PersonalityPanel";
import V2BackstoryPanel from "../components/pages/background/V2BackstoryPanel";
import V2MoodboardPanel from "../components/pages/background/V2MoodboardPanel";
import "../styles/pages/v2-background.scss";

const V2Background = () => {
  return (
    <section className="v2-page v2-background-page">
      <div className="v2-background-grid">
        <div className="v2-background-info-stack">
          <V2IdentityPanel />
          <V2PersonalityPanel />
          <V2BackstoryPanel />
        </div>

        <V2MoodboardPanel />
      </div>
    </section>
  );
};

export default V2Background;
