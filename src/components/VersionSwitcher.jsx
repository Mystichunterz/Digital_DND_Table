import { useLocation, useNavigate } from "react-router-dom";
import "../styles/components/version-switcher.scss";

const SUPPORTED_SUBPATHS = new Set(["/overview", "/background"]);

const getVersionContext = (pathname) => {
  if (pathname.startsWith("/legacy")) {
    return {
      currentLabel: "Legacy",
      currentBase: "/legacy",
      targetLabel: "V2",
      targetBase: "/v2",
    };
  }

  return {
    currentLabel: "V2",
    currentBase: "/v2",
    targetLabel: "Legacy",
    targetBase: "/legacy",
  };
};

const getSubpath = (pathname, basePath) => {
  const rawSubpath = pathname.startsWith(basePath)
    ? pathname.slice(basePath.length)
    : "";
  const normalizedSubpath = rawSubpath
    ? rawSubpath.startsWith("/")
      ? rawSubpath
      : `/${rawSubpath}`
    : "/";

  if (normalizedSubpath === "/") {
    return "/overview";
  }

  return SUPPORTED_SUBPATHS.has(normalizedSubpath)
    ? normalizedSubpath
    : "/overview";
};

const VersionSwitcher = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { currentLabel, currentBase, targetLabel, targetBase } =
    getVersionContext(pathname);
  const subpath = getSubpath(pathname, currentBase);

  const handleSwitch = () => {
    navigate(`${targetBase}${subpath}`);
  };

  return (
    <button
      type="button"
      className="version-switcher"
      onClick={handleSwitch}
      aria-label={`Switch to ${targetLabel}`}
    >
      <span className="version-switcher-current">{currentLabel}</span>
      <span>Switch to {targetLabel}</span>
    </button>
  );
};

export default VersionSwitcher;
