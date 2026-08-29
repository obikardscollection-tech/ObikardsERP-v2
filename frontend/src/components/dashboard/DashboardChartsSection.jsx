import { memo, useMemo } from "react";
import { BarChart3, ChartNoAxesCombined, PieChart } from "lucide-react";
import {
  formatCurrency,
  formatDateLabel,
  formatPercent,
} from "./dashboardFormatters";

const METRIC_COLORS = {
  grossFlow: "#0f766e",
  salesAmount: "#0f766e",
  purchasesAmount: "#1d4ed8",
  expensesAmount: "#be123c",
};

const METRIC_LABELS = {
  grossFlow: "Solde d'operations",
  salesAmount: "Ventes",
  purchasesAmount: "Achats",
  expensesAmount: "Depenses",
};

function DashboardChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-80 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
  );
}

function TrendPath({ values, labels, color }) {
  if (values.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center border-y border-slate-100 text-sm text-slate-500">
        Aucune operation sur la periode
      </div>
    );
  }

  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;
  const yForValue = (value) => 190 - ((value - minValue) / range) * 170;

  const points = values.map((value, index) => {
    const x = values.length === 1 ? 320 : 10 + (index / (values.length - 1)) * 620;
    const y = yForValue(value);
    return `${x},${y}`;
  });

  const middleIndex = Math.floor((labels.length - 1) / 2);

  return (
    <div>
      <div className="flex gap-3">
        <div className="flex h-44 w-20 shrink-0 flex-col justify-between py-1 text-right text-[11px] text-slate-500">
          <span>{formatCurrency(maxValue)}</span>
          <span>{formatCurrency((maxValue + minValue) / 2)}</span>
          <span>{formatCurrency(minValue)}</span>
        </div>
        <svg viewBox="0 0 640 200" className="h-44 min-w-0 flex-1" preserveAspectRatio="none" role="img" aria-label="Evolution de la metrique selectionnee">
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[20, 105, 190].map((y) => (
            <line key={y} x1="10" y1={y} x2="630" y2={y} stroke="#e2e8f0" strokeWidth="1" />
          ))}
          {minValue < 0 && maxValue > 0 ? (
            <line x1="10" y1={yForValue(0)} x2="630" y2={yForValue(0)} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5 5" />
          ) : null}
          <polygon fill="url(#trend-fill)" points={`10,190 ${points.join(" ")} 630,190`} />
          <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points.join(" ")} />
          {values.map((value, index) => {
            const [x, y] = points[index].split(",");
            return (
              <circle key={`${labels[index]}-${index}`} cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="3">
                <title>{`${formatDateLabel(labels[index])}: ${formatCurrency(value)}`}</title>
              </circle>
            );
          })}
        </svg>
      </div>
      <div className="ml-[92px] mt-2 flex justify-between text-[11px] text-slate-500">
        <span>{formatDateLabel(labels[0])}</span>
        {labels.length > 2 ? <span>{formatDateLabel(labels[middleIndex])}</span> : null}
        {labels.length > 1 ? <span>{formatDateLabel(labels[labels.length - 1])}</span> : null}
      </div>
    </div>
  );
}

function BreakdownBars({ items, emptyLabel }) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">{emptyLabel}</p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.key}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">{item.key}</span>
            <span className="text-slate-500">{formatPercent(item.share || 0)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900/85"
              style={{ width: `${Math.min(item.share || 0, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardChartsSectionBase({
  loading = false,
  timeline = [],
  selectedMetric = "grossFlow",
  breakdowns,
  transactions,
}) {
  const chartValues = useMemo(
    () => timeline.map((entry) => Number(entry[selectedMetric]) || 0),
    [timeline, selectedMetric]
  );
  const chartLabels = useMemo(
    () => timeline.map((entry) => entry.period),
    [timeline]
  );

  const metricTotal = useMemo(
    () => chartValues.reduce((sum, value) => sum + value, 0),
    [chartValues]
  );

  const transactionMix = useMemo(() => {
    const sales = Number(transactions?.sales) || 0;
    const purchases = Number(transactions?.purchases) || 0;
    const expenses = Number(transactions?.expenses) || 0;
    const total = sales + purchases + expenses;

    return {
      sales,
      purchases,
      expenses,
      total,
      gradient: total > 0
        ? `conic-gradient(#0f766e 0 ${(sales / total) * 360}deg, #1d4ed8 ${(sales / total) * 360}deg ${((sales + purchases) / total) * 360}deg, #be123c ${((sales + purchases) / total) * 360}deg 360deg)`
        : "conic-gradient(#cbd5e1 0deg 360deg)",
    };
  }, [transactions]);

  if (loading) {
    return <DashboardChartsSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm 2xl:col-span-2">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-[var(--font-display)] text-lg font-semibold text-slate-900">
              <ChartNoAxesCombined className="h-5 w-5 text-teal-700" />
              Evolution {METRIC_LABELS[selectedMetric] || "Flux"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {timeline.length > 0
                ? `${formatDateLabel(timeline[0]?.period)} - ${formatDateLabel(timeline[timeline.length - 1]?.period)}`
                : "Aucune donnee"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-100 px-3 py-2 text-right">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Cumul</p>
            <p className="font-semibold text-slate-900">{formatCurrency(metricTotal)}</p>
          </div>
        </header>

        <TrendPath
          values={chartValues}
          labels={chartLabels}
          color={METRIC_COLORS[selectedMetric] || "#0f766e"}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-[var(--font-display)] text-lg font-semibold text-slate-900">
          <BarChart3 className="h-5 w-5 text-slate-700" />
          Ventes par plateforme
        </h3>
        <BreakdownBars
          items={(breakdowns?.salesByPlatform || []).slice(0, 6)}
          emptyLabel="Aucune plateforme de vente disponible"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-[var(--font-display)] text-lg font-semibold text-slate-900">
          <PieChart className="h-5 w-5 text-slate-700" />
          Mix de transactions
        </h3>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div
            className="h-28 w-28 rounded-full border border-slate-200"
            style={{ background: transactionMix.gradient }}
          />

          <div className="w-full space-y-2 sm:w-auto">
            <p className="flex items-center justify-between gap-3 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-teal-700" />Ventes</span>
              <strong>{transactionMix.sales}</strong>
            </p>
            <p className="flex items-center justify-between gap-3 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-700" />Achats</span>
              <strong>{transactionMix.purchases}</strong>
            </p>
            <p className="flex items-center justify-between gap-3 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-700" />Depenses</span>
              <strong>{transactionMix.expenses}</strong>
            </p>
            <p className="pt-1 text-xs text-slate-500">Total operations: {transactionMix.total}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export const DashboardChartsSection = memo(DashboardChartsSectionBase);
