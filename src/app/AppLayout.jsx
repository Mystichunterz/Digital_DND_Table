import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import LeftPanel from "./LeftPanel";
import TabBar from "./TabBar";
import PersistenceIndicator from "./PersistenceIndicator";
import { ConditionsProvider } from "@/state/ConditionsContext";
import { CharacterStatsProvider } from "@/state/CharacterStatsContext";
import { PersistenceStatusProvider } from "@/state/PersistenceStatusContext";
import "./app-layout.scss";

const AppLayout = () => {
  useEffect(() => {
    document.body.classList.add("v2-active");

    return () => {
      document.body.classList.remove("v2-active");
    };
  }, []);

  // Warm the lazy journal chunk in the background after the shell is
  // interactive so the first navigation to /journal doesn't pay the
  // module-compile + chunk-fetch cost.
  useEffect(() => {
    const warm = () => {
      import("@/features/journal/JournalPage");
    };
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(warm, { timeout: 1500 });
      return () => window.cancelIdleCallback?.(handle);
    }
    const handle = window.setTimeout(warm, 250);
    return () => window.clearTimeout(handle);
  }, []);

  return (
    <PersistenceStatusProvider>
      <ConditionsProvider>
        <CharacterStatsProvider>
          <div className="shell">
            <aside className="left-panel">
              <LeftPanel />
            </aside>

            <main className="right-panel">
              <div className="right-pane">
                <TabBar />

                <section className="right-surface">
                  <Outlet />
                </section>
              </div>
            </main>
          </div>
          <PersistenceIndicator />
        </CharacterStatsProvider>
      </ConditionsProvider>
    </PersistenceStatusProvider>
  );
};

export default AppLayout;
