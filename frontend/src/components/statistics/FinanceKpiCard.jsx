import {
  formatValue,
  formatVariation,
  getVariationClasses,
} from "../../utils/statisticsFormatter";

export default function FinanceKpiCard({
  label,
  value,
  previousValue,
  variation,
  format,
  inverseTrend,
  loading,
  error,
}) {
  if (loading) {
    return (
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-28 rounded bg-slate-200" />
          <div className="h-8 w-36 rounded bg-slate-200" />
          <div className="h-6 w-20 rounded bg-slate-200" />
          <div className="h-3 w-40 rounded bg-slate-200" />
        </div>
      </article>
    );
  }

  if (error) {
    return (
      <article className="rounded-xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">{label}</p>
        <p className="mt-3 text-sm font-medium text-rose-800">Impossible de charger cet indicateur.</p>
        <p className="mt-2 text-xs text-rose-700">{error}</p>
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getVariationClasses(variation, inverseTrend)}`}>
          {formatVariation(variation)}
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-900">{formatValue(value, format)}</p>
      <p className="mt-3 text-sm text-slate-500">
        Periode precedente : <span className="font-semibold text-slate-700">{formatValue(previousValue, format)}</span>
      </p>
    </article>
  );
}