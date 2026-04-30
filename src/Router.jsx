//----------------------
// src > Router.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { Routes, Route, Navigate } from "react-router-dom";
import LegacyLayout from "./legacy/layout/AppLayout";
import LegacyOverview from "./legacy/pages/Overview";
import LegacyNotFound from "./legacy/pages/NotFound";
import LegacyBackground from "./legacy/pages/Background";
import V2Layout from "./v2/layout/V2Layout";
import V2Overview from "./v2/pages/V2Overview";
import V2Background from "./v2/pages/V2Background";
import V2Journal from "./v2/pages/V2Journal";
import V2AssetManager from "./v2/pages/V2AssetManager";
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
        <Route path="journal" element={<V2Journal />} />
        <Route path="assets" element={<V2AssetManager />} />
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
