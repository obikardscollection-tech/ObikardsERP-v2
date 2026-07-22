import { Funnel, Search, SlidersHorizontal, X } from "lucide-react";

const PERIOD_OPTIONS = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
  { value: "365d", label: "12 mois" },
];

const ACTIVITY_OPTIONS = [
  { value: "ALL", label: "Toutes activites" },
  { value: "SALE", label: "Ventes" },
  { value: "PURCHASE", label: "Achats" },
  { value: "EXPENSE", label: "Depenses" },
];

const METRIC_OPTIONS = [
  { value: "grossFlow", label: "Flux net" },
  { value: "salesAmount", label: "Ventes" },
  { value: "purchasesAmount", label: "Achats" },
  { value: "expensesAmount", label: "Depenses" },
];

export function DashboardFilters({
  loading = false,
  period,
  onPeriodChange,
  activityType,
  onActivityTypeChange,
  search,
  onSearchChange,
  metric,
  onMetricChange,
  onReset,
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-100/70 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-amber-100/80 blur-2xl" />

      <div className="relative">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-slate-900 p-2 text-white">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-[var(--font-display)] text-lg font-semibold text-slate-900">Filtres intelligents</h2>
              <p className="text-xs text-slate-500">Les changements de periode rechargent les donnees backend</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-3.5 w-3.5" />
            Reinitialiser
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Funnel className="h-3.5 w-3.5" />
              Fenetre temporelle
            </p>
            <div className="flex flex-wrap gap-2">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => onPeriodChange(option.value)}
                  disabled={loading}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    period === option.value
                      ? "bg-slate-900 text-white shadow"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="xl:col-span-3">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="dashboard-activity-filter">
              Type d'activite
            </label>
            <select
              id="dashboard-activity-filter"
              value={activityType}
              onChange={(event) => onActivityTypeChange(event.target.value)}
              disabled={loading}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-500"
            >
              {ACTIVITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="xl:col-span-3">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="dashboard-search-filter">
              Recherche rapide
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="dashboard-search-filter"
                type="text"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                disabled={loading}
                placeholder="Reference, statut, plateforme..."
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
              />
            </div>
          </div>

          <div className="xl:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="dashboard-metric-filter">
              Courbe
            </label>
            <select
              id="dashboard-metric-filter"
              value={metric}
              onChange={(event) => onMetricChange(event.target.value)}
              disabled={loading}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-500"
            >
              {METRIC_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
