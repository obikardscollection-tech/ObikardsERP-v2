import { RefreshCw } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { DashboardCards } from "../components/dashboard/DashboardCards";
import { DashboardCharts } from "../components/dashboard/DashboardCharts";
import { DashboardRecentSales } from "../components/dashboard/DashboardRecentSales";
import { DashboardRecentPurchases } from "../components/dashboard/DashboardRecentPurchases";
import { DashboardRecentExpenses } from "../components/dashboard/DashboardRecentExpenses";
import { DashboardLowStock } from "../components/dashboard/DashboardLowStock";
import { DashboardQuickActions } from "../components/dashboard/DashboardQuickActions";
import { useDashboard } from "../hooks/useDashboard";

export default function DashboardPage() {
  const { loading, error, data, refresh } = useDashboard();

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-slate-50 p-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
            <p className="mt-2 text-slate-600">Vue d'ensemble de votre ERP</p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              <strong>Erreur :</strong> {error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">Chargement du tableau de bord...</p>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8">
          <DashboardStats data={data} loading={loading} />
        </div>

        {/* Key Metrics Cards */}
        <div className="mb-8">
          <DashboardCards data={data} loading={loading} />
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <DashboardCharts data={data} loading={loading} />
        </div>

        {/* Recent Data Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <DashboardRecentSales data={data} loading={loading} />
          <DashboardRecentPurchases data={data} loading={loading} />
          <DashboardRecentExpenses data={data} loading={loading} />
        </div>

        {/* Low Stock and Quick Actions Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DashboardLowStock data={data} loading={loading} />
          <DashboardQuickActions />
        </div>
      </main>
    </div>
  );
}
