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
  grossFlow: "Flux net",
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

function TrendPath({ values, color }) {
  if (values.length < 2) {
    return (
      <svg viewBox="0 0 100 44" className="h-36 w-full">
        <line x1="0" y1="40" x2="100" y2="40" stroke="#cbd5e1" strokeWidth="1.5" />
      </svg>
    );
  }

  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const y = 38 - ((value - minValue) / range) * 30;
    return `${x},${y}`;
  });

  return (
    <svg viewBox="0 0 100 44" className="h-36 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        points={points.join(" ")}
      />
      <polygon
        fill="url(#trend-fill)"
        points={`0,40 ${points.join(" ")} 100,40`}
      />
    </svg>
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

        <TrendPath values={chartValues} color={METRIC_COLORS[selectedMetric] || "#0f766e"} />
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
