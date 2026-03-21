import { Outlet } from "react-router-dom";
import "../styles/v2-layout.scss";

const V2Layout = () => {
  return (
    <div className="v2-shell">
      <Outlet />
    </div>
  );
};

export default V2Layout;
