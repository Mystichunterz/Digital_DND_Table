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
      <aside className="left-container">
        <LeftDisplay />
      </aside>
      <main className="right-container">
        <RightPane />
      </main>
    </div>
  );
};

//----------------------
//  exports
//----------------------
export default AppLayout;
