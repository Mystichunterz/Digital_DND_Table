import React from "react";
import { Outlet } from "react-router-dom";
import TabNavigation from "./TabNavigation";

const RightPane = () => {
  return (
    <div className="right-pane">
      <div className="tab-navigation">
        <TabNavigation />
      </div>
      <div className="pane-content">Pane Content</div>
    </div>
  );
};

export default RightPane;
