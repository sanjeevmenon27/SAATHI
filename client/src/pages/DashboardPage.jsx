import { Suspense, lazy } from "react";
import { useAuth } from "../context/AuthContext";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

const AdminDashboard = lazy(() => import("./dashboards/AdminDashboard").then((module) => ({ default: module.AdminDashboard })));
const ElderDashboard = lazy(() => import("./dashboards/ElderDashboard").then((module) => ({ default: module.ElderDashboard })));
const SaathiDashboard = lazy(() => import("./dashboards/SaathiDashboard").then((module) => ({ default: module.SaathiDashboard })));

const DashboardFallback = () => (
  <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
    <div className="rounded-[28px] bg-white p-5 shadow-card sm:p-6">
      <LoadingSkeleton rows={4} />
    </div>
  </div>
);

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <Suspense fallback={<DashboardFallback />}>
      {user?.role === "admin" ? (
        <AdminDashboard />
      ) : user?.role === "saathi" ? (
        <SaathiDashboard />
      ) : (
        <ElderDashboard />
      )}
    </Suspense>
  );
};
