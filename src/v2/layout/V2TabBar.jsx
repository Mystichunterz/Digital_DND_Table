import { NavLink } from "react-router-dom";

const tabs = [
  { path: "overview", label: "Overview" },
  { path: "inventory", label: "Inventory" },
  { path: "background", label: "Background" },
  { path: "companions", label: "Companions" },
  { path: "journal", label: "Journal" },
  { path: "assets", label: "Asset Manager" },
];

const getTabClassName = ({ isActive }) =>
  isActive ? "v2-tab-bar-link is-active" : "v2-tab-bar-link";

const V2TabBar = () => {
  return (
    <nav className="v2-tab-bar" aria-label="V2 sections">
      {tabs.map((tab) => (
        <NavLink key={tab.path} to={tab.path} className={getTabClassName}>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default V2TabBar;
