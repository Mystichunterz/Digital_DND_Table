//----------------------
//  src > layout > LeftDisplay.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { Outlet } from "react-router-dom";
import TabNavigation from "./TabNavigation";

//----------------------
//  main
//----------------------
const RightPane = () => {
  return (
    <div className="right-pane">
      <TabNavigation />
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
