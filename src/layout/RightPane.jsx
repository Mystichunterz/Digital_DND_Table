//----------------------
//  src > layout > LeftDisplay.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { Outlet } from "react-router-dom";
import TabNavigation from "./TabNavigation";

const RightPane = () => {
  return (
    <div className="right-pane">
      <div className="tab-navigation">
        <TabNavigation />
      </div>
      <div className="pane-content">
        <Outlet />
      </div>
    </div>
  );
};

//----------------------
//  exports
//----------------------
export default RightPane;
