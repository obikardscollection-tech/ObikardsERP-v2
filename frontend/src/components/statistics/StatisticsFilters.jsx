const PERIOD_OPTIONS = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
  { value: "365d", label: "12 mois" },
];

export default function StatisticsFilters({
  period,
  onPeriodChange,
  onRefresh,
  loading,
  refreshing,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Periode</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={loading || refreshing}
                onClick={() => onPeriodChange(option.value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  period === option.value
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading || refreshing}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? "Actualisation..." : "Actualiser"}
        </button>
      </div>
    </section>
  );
}