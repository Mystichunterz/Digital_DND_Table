//----------------------
//  src > layout > AppLayout.jsx
//----------------------

//----------------------
//  imports
//----------------------
import LeftDisplay from "./LeftDisplay";
import RightPane from "./RightPane";

import "../styles/layout/layout.scss";

//----------------------
//  main
//----------------------
const AppLayout = () => {
  return (
    <div className="app-layout">
      <div className="main-container">
        <aside className="left-main-container">
          <LeftDisplay />
        </aside>
        <section className="right-main-container">
          <div className="right-pane">
            <RightPane />
          </div>
        </section>
      </div>
    </div>
  );
};

//----------------------
//  exports
//----------------------
export default AppLayout;
