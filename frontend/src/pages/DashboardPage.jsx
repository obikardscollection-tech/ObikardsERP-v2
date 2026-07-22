import {
  Boxes,
  CircleDollarSign,
  Package,
  Receipt,
  RefreshCw,
  Scale,
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import { DashboardAlerts } from "../components/dashboard/DashboardAlerts";
import { DashboardRecentActivity } from "../components/dashboard/DashboardRecentActivity";
import { DashboardSection } from "../components/dashboard/DashboardSection";
import { DashboardStatCard } from "../components/dashboard/DashboardStatCard";
import { DashboardSummary } from "../components/dashboard/DashboardSummary";
import { useDashboard } from "../hooks/useDashboard";

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(value || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function DashboardPage() {
  const { loading, error, data, refresh } = useDashboard();

  const stats = [
    {
      label: "Total articles",
      value: formatNumber(data.overview.totalItems),
      hint: "Nombre de lignes inventaire",
      icon: Package,
      tone: "blue",
    },
    {
      label: "Quantite totale",
      value: formatNumber(data.overview.totalQuantity),
      hint: "Somme des quantites declarees",
      icon: Boxes,
      tone: "emerald",
    },
    {
      label: "Valeur stock estimee",
      value: formatCurrency(data.overview.estimatedStockValue),
      hint: "Prix d'achat x quantite (IN_STOCK)",
      icon: Scale,
      tone: "amber",
    },
    {
      label: "Nombre de ventes",
      value: formatNumber(data.overview.totalSalesCount),
      hint: "Historique cumule",
      icon: Receipt,
      tone: "slate",
    },
    {
      label: "Montant des ventes",
      value: formatCurrency(data.overview.totalSalesAmount),
      hint: "Somme de totalAmount",
      icon: CircleDollarSign,
      tone: "rose",
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-slate-50 p-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
            <p className="mt-2 text-slate-600">Indicateurs business dynamiques de votre ERP</p>
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

        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              <strong>Erreur :</strong> {error}
            </p>
          </div>
        )}

        <DashboardSection
          title="KPI principaux"
          subtitle="Valeurs calculees a partir des endpoints existants"
          className="mb-8"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map((stat) => (
              <DashboardStatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                hint={stat.hint}
                icon={stat.icon}
                tone={stat.tone}
                loading={loading}
              />
            ))}
          </div>
        </DashboardSection>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardRecentActivity
              loading={loading}
              activities={data.recentActivity}
            />
          </div>

          <div className="space-y-6">
            <DashboardSummary
              loading={loading}
              overview={data.overview}
              generatedAt={data.generatedAt}
            />

            <DashboardAlerts
              loading={loading}
              alerts={data.alerts}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
