import { NavLink } from "react-router-dom";

const tabs = [
  { path: "overview", label: "Overview" },
  { path: "inventory", label: "Inventory" },
  { path: "background", label: "Background" },
  { path: "companions", label: "Companions" },
  { path: "calculator", label: "Calculator" },
  { path: "journal", label: "Journal" },
  { path: "assets", label: "Asset Manager" },
];

const getTabClassName = ({ isActive }) =>
  isActive ? "tab-bar-link is-active" : "tab-bar-link";

const TabBar = () => {
  return (
    <nav className="tab-bar" aria-label="Sections">
      {tabs.map((tab) => (
        <NavLink key={tab.path} to={tab.path} className={getTabClassName}>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default TabBar;
