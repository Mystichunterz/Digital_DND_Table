import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import AppLayout from "./AppLayout";
import NotFoundPage from "./NotFoundPage";
import OverviewPage from "@/features/overview/OverviewPage";

// The Overview HUD is the landing page, so it stays in the main bundle.
// Every other page loads on first visit: Background pulls in image
// processing + the moodboard, Inventory the paper-doll grids, Asset
// Manager the icon-loading code, Journal react-markdown.
const InventoryPage = lazy(() => import("@/features/inventory/InventoryPage"));
const BackgroundPage = lazy(
  () => import("@/features/background/BackgroundPage"),
);
const CompanionsPage = lazy(
  () => import("@/features/companions/CompanionsPage"),
);
const CalculatorPage = lazy(
  () => import("@/features/calculator/CalculatorPage"),
);
const JournalPage = lazy(() => import("@/features/journal/JournalPage"));
const AssetManagerPage = lazy(
  () => import("@/features/asset-manager/AssetManagerPage"),
);

const lazyRoute = (Component) => (
  <Suspense fallback={null}>
    <Component />
  </Suspense>
);

// Pages used to live under /v2/*; keep old bookmarks working.
const RedirectFromV2 = () => {
  const { "*": rest } = useParams();
  return <Navigate to={`/${rest ?? ""}`} replace />;
};

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="inventory" element={lazyRoute(InventoryPage)} />
        <Route path="background" element={lazyRoute(BackgroundPage)} />
        <Route path="companions" element={lazyRoute(CompanionsPage)} />
        <Route path="calculator" element={lazyRoute(CalculatorPage)} />
        <Route path="journal" element={lazyRoute(JournalPage)} />
        <Route path="assets" element={lazyRoute(AssetManagerPage)} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/v2/*" element={<RedirectFromV2 />} />
      <Route path="/legacy/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Router;
