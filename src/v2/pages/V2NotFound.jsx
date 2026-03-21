import { Link } from "react-router-dom";

const V2NotFound = () => {
  return (
    <section className="v2-page v2-not-found">
      <h2>Section Not Found</h2>
      <p>This V2 route is not built yet.</p>
      <Link to="/v2/overview" className="v2-inline-link">
        Return to V2 Overview
      </Link>
    </section>
  );
};

export default V2NotFound;
