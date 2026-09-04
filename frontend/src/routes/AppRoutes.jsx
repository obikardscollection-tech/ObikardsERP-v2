import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Inventory = lazy(() => import("../pages/Inventory"));
const Customers = lazy(() => import("../pages/Customers"));
const Suppliers = lazy(() => import("../pages/Suppliers"));
const Purchases = lazy(() => import("../pages/Purchases"));
const Receptions = lazy(() => import("../pages/Receptions"));
const Sales = lazy(() => import("../pages/Sales"));
const Expenses = lazy(() => import("../pages/Expenses"));
const Statistics = lazy(() => import("../pages/Statistics"));
const SportsCardsProPage = lazy(() =>
  import("../pages/SportsCardsPro/SportsCardsProPage")
);
const Login = lazy(() => import("../pages/Login"));
const Backups = lazy(() => import("../pages/Backups"));

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 xl:p-8">
          Chargement de la page...
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/receptions" element={<Receptions />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/sports-cards-pro" element={<SportsCardsProPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/backups" element={<Backups />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;