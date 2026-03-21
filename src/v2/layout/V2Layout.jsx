import { Outlet } from "react-router-dom";
import V2TabNavigation from "./V2TabNavigation";
import "../styles/v2-layout.scss";

const V2Layout = () => {
  return (
    <div className="v2-shell">
      <header className="v2-shell-header">
        <div>
          <p className="v2-kicker">Digital DnD Table</p>
          <h1>V2 Build Workspace</h1>
        </div>
        <p className="v2-subtitle">
          Rebuild with cleaner architecture, reusable components, and responsive
          behavior first.
        </p>
      </header>

      <V2TabNavigation />

      <main className="v2-shell-content">
        <Outlet />
      </main>
    </div>
  );
};

export default V2Layout;
