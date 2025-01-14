import React from "react";
import { NavLink } from "react-router-dom";

const TabNavigation = () => {
  const tabs = [
    { path: "/overview", label: "Overview" },
    { path: "/details", label: "Details" },
    { path: "/settings", label: "Settings" },
  ];

  return (
    <ul className="tab-list">
      {tabs.map((tab, index) => (
        <li key={index}>
          <NavLink to={tab.path} className={({ isActive }) => (isActive ? "active-tab" : "tab")}>
            {tab.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default TabNavigation;
