import { NavLink } from "react-router-dom";

const tabs = [
  { path: "overview", label: "Overview" },
  { path: "background", label: "Background" },
];

const V2TabNavigation = () => {
  return (
    <nav className="v2-tabs" aria-label="Version 2 sections">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) => (isActive ? "v2-tab active" : "v2-tab")}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default V2TabNavigation;
