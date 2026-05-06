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
import V2NotFound from "./v2/pages/V2NotFound";

// Routes split into their own bundle. The Overview HUD is the
// default landing surface, so it stays eagerly loaded; everything
// else loads on demand the first time the user navigates to it.
// V2Background pulls in image processing + moodboard JSX,
// V2Inventory pulls in the paper-doll grids, V2AssetManager pulls
// in the largest amount of icon-loading code, V2Journal pulls in
// react-markdown — all are rare-entry pages so they don't pay on
// the Overview boot path. Legacy is reference-only.
const V2Inventory = lazy(() => import("./v2/pages/V2Inventory"));
const V2Background = lazy(() => import("./v2/pages/V2Background"));
const V2Companions = lazy(() => import("./v2/pages/V2Companions"));
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
        <Route path="inventory" element={lazyRoute(V2Inventory)} />
        <Route path="background" element={lazyRoute(V2Background)} />
        <Route path="companions" element={lazyRoute(V2Companions)} />
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
