import { useMemo, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import { DashboardAlerts } from "../components/dashboard/DashboardAlerts";
import { DashboardChartsSection } from "../components/dashboard/DashboardChartsSection";
import { DashboardFilters } from "../components/dashboard/DashboardFilters";
import { DashboardKpiSection } from "../components/dashboard/DashboardKpiSection";
import { DashboardRecentActivity } from "../components/dashboard/DashboardRecentActivity";
import { DashboardSection } from "../components/dashboard/DashboardSection";
import { DashboardSummary } from "../components/dashboard/DashboardSummary";
import { formatDateTime } from "../components/dashboard/dashboardFormatters";
import { useDashboard } from "../hooks/useDashboard";

export default function DashboardPage() {
  const [period, setPeriod] = useState("30d");
  const [activityType, setActivityType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [metric, setMetric] = useState("grossFlow");
  const dashboardFilters = useMemo(
    () => ({ period }),
    [period]
  );
  const { loading, isRefreshing, error, data, refresh } = useDashboard(dashboardFilters);

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (data.recentActivity || []).filter((item) => {
      if (activityType !== "ALL" && item.type !== activityType) {
        return false;
      }

      if (!query) {
        return true;
      }

      const content = [
        item.reference,
        item.platform,
        item.status,
        item.counterparty,
        item.sport,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return content.includes(query);
    });
  }, [activityType, data.recentActivity, search]);

  const visibleLoadingState = loading && !data.generatedAt;

  const headerSubtext = useMemo(() => {
    if (!data.generatedAt) {
      return "Indicateurs business dynamiques de votre ERP";
    }

    return `Derniere synchronisation: ${formatDateTime(data.generatedAt)}`;
  }, [data.generatedAt]);

  const resetFilters = () => {
    setPeriod("30d");
    setActivityType("ALL");
    setSearch("");
    setMetric("grossFlow");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="relative flex-1 overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_#ecfeff_0%,_#f8fafc_45%,_#f1f5f9_100%)] p-4 sm:p-6 xl:p-8">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-cyan-200/50 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 left-12 h-64 w-64 rounded-full bg-amber-200/50 blur-3xl" />

        <div className="relative mx-auto w-full max-w-[1500px] space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                  Dashboard analytique
                </p>
                <h1 className="mt-4 font-[var(--font-display)] text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  Tableau de bord business
                </h1>
                <p className="mt-2 text-sm text-slate-600 sm:text-base">{headerSubtext}</p>
              </div>

              <button
                onClick={refresh}
                disabled={loading || isRefreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${(loading || isRefreshing) ? "animate-spin" : ""}`} />
                {isRefreshing ? "Actualisation" : "Actualiser"}
              </button>
            </div>
          </section>

          <DashboardFilters
            loading={visibleLoadingState}
            period={period}
            onPeriodChange={setPeriod}
            activityType={activityType}
            onActivityTypeChange={setActivityType}
            search={search}
            onSearchChange={setSearch}
            metric={metric}
            onMetricChange={setMetric}
            onReset={resetFilters}
          />

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm text-rose-800">
                <strong>Erreur:</strong> {error}
              </p>
            </div>
          )}

          <DashboardSection
            title="Indicateurs cle"
            subtitle="Performance commerciale, stock et rentabilite"
          >
            <DashboardKpiSection
              loading={visibleLoadingState}
              overview={data.overview}
              comparisons={data.comparisons}
            />
          </DashboardSection>

          <DashboardSection
            title="Visualisations"
            subtitle="Tendances financieres et repartitions multi-dimensions"
          >
            <DashboardChartsSection
              loading={visibleLoadingState}
              timeline={data?.charts?.financeTimeline || []}
              selectedMetric={metric}
              breakdowns={data.breakdowns}
              transactions={data.charts?.transactionsByType}
            />
          </DashboardSection>

          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-12">
            <div className="2xl:col-span-8">
              <DashboardRecentActivity
                loading={visibleLoadingState}
                activities={filteredActivities}
              />
            </div>

            <div className="space-y-6 2xl:col-span-4">
              <DashboardSummary
                loading={visibleLoadingState}
                overview={data.overview}
                generatedAt={data.generatedAt}
              />

              <DashboardAlerts
                loading={visibleLoadingState}
                alerts={data.alerts}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
