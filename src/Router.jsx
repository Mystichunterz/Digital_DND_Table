//----------------------
// src > Router.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Overview from "./pages/Overview";
import NotFound from "./pages/NotFound";
import Background from "./pages/Background";

//----------------------
//  main
//----------------------
const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route path="overview" element={<Overview />} />
        <Route path="background" element={<Background />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

//----------------------
//  exports
//----------------------
export default Router;
