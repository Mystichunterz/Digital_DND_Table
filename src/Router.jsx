//----------------------
// src > Router.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import V2Layout from "./v2/layout/V2Layout";
import V2Overview from "./v2/pages/V2Overview";
import V2Background from "./v2/pages/V2Background";
import V2Companions from "./v2/pages/V2Companions";
import V2NotFound from "./v2/pages/V2NotFound";

// Routes split into their own bundle. Asset Manager pulls in the
// largest amount of icon-loading code; Journal pulls in
// react-markdown. Both are rare-entry pages, so we don't pay for
// them on the Overview boot path. Legacy is reference-only and
// loads on demand when the user toggles.
const V2Journal = lazy(() => import("./v2/journal/V2Journal"));
const V2AssetManager = lazy(() => import("./v2/pages/V2AssetManager"));
const LegacyLayout = lazy(() => import("./legacy/layout/AppLayout"));
const LegacyOverview = lazy(() => import("./legacy/pages/Overview"));
const LegacyBackground = lazy(() => import("./legacy/pages/Background"));
const LegacyNotFound = lazy(() => import("./legacy/pages/NotFound"));

const lazyRoute = (Component) => (
  <Suspense fallback={null}>
    <Component />
  </Suspense>
);

//----------------------
//  main
//----------------------
const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/v2/overview" replace />} />

      <Route path="/legacy" element={lazyRoute(LegacyLayout)}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={lazyRoute(LegacyOverview)} />
        <Route path="background" element={lazyRoute(LegacyBackground)} />
        <Route path="*" element={lazyRoute(LegacyNotFound)} />
      </Route>

      <Route path="/v2" element={<V2Layout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<V2Overview />} />
        <Route path="background" element={<V2Background />} />
        <Route path="companions" element={<V2Companions />} />
        <Route path="journal" element={lazyRoute(V2Journal)} />
        <Route path="assets" element={lazyRoute(V2AssetManager)} />
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
