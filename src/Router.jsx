//----------------------
// src > Router.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { Routes, Route, Navigate } from "react-router-dom";
import LegacyLayout from "./legacy/layout/LegacyLayout";
import LegacyOverview from "./legacy/pages/LegacyOverview";
import LegacyNotFound from "./legacy/pages/LegacyNotFound";
import LegacyBackground from "./legacy/pages/LegacyBackground";
import V2Layout from "./v2/layout/V2Layout";
import V2Overview from "./v2/pages/V2Overview";
import V2Background from "./v2/pages/V2Background";
import V2NotFound from "./v2/pages/V2NotFound";

//----------------------
//  main
//----------------------
const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/v2/overview" replace />} />

      <Route path="/legacy" element={<LegacyLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<LegacyOverview />} />
        <Route path="background" element={<LegacyBackground />} />
        <Route path="*" element={<LegacyNotFound />} />
      </Route>

      <Route path="/v2" element={<V2Layout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<V2Overview />} />
        <Route path="background" element={<V2Background />} />
        <Route path="*" element={<V2NotFound />} />
      </Route>

      <Route path="*" element={<Navigate to="/v2/overview" replace />} />
    </Routes>
  );
};

//----------------------
//  exports
//----------------------
export default Router;
