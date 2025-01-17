//----------------------
//  src > layout > LeftDisplay.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { NavLink } from "react-router-dom";
import "../styles/layout/tab-navigation.scss";

//----------------------
//  main
//----------------------
const TabNavigation = () => {
  const tabs = [
    { path: "/overview", label: "Overview" },
    { path: "/spellbook", label: "Spellbook" },
    { path: "/calculator", label: "Calculator" },
    { path: "/background", label: "Background" },
    { path: "/familiars", label: "Familiars" },
  ];

  return (
    <ul className="navtab-list">
      {tabs.map((tab, index) => (
        <li key={index}>
          <NavLink to={tab.path} className={({ isActive }) => (isActive ? "active tab" : "tab")}>
            {tab.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

//----------------------
//  exports
//----------------------
export default TabNavigation;
