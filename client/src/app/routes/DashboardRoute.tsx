import { lazy, Suspense } from "react";

const DashboardPage = lazy(() => import("../../pages/DashboardPage"));

export const DashboardRoute = () => (
  <Suspense
    fallback={
      <div className="p-8 text-sm text-neutral-500">Loading dashboard...</div>
    }
  >
    <DashboardPage />
  </Suspense>
);

export default DashboardRoute;
