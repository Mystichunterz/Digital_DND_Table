import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import V2LeftPanel from "./V2LeftPanel";
import V2TabBar from "./V2TabBar";
import "../styles/v2-layout.scss";

const V2Layout = () => {
  useEffect(() => {
    document.body.classList.add("v2-active");

    return () => {
      document.body.classList.remove("v2-active");
    };
  }, []);

  return (
    <div className="v2-shell">
      <aside className="v2-left-panel">
        <V2LeftPanel />
      </aside>

      <main className="v2-right-panel">
        <div className="v2-right-pane">
          <V2TabBar />

          <section className="v2-right-surface">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  );
};

export default V2Layout;
