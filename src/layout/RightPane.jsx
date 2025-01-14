import React from "react";
import { Outlet } from "react-router-dom";
import TabNavigation from "./TabNavigation";

const RightPane = () => {
  return (
    <div className="right-pane-content">
      <header className="tab-navigation">
        <TabNavigation />
      </header>
      <main className="pane-content">
        <Outlet /> {/* Dynamically renders the selected view */}
      </main>
    </div>
  );
};

export default RightPane;
