import { memo, useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  HandCoins,
  Package,
  Percent,
  Receipt,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import {
  formatCompactNumber,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "./dashboardFormatters";

function KpiTrend({ value }) {
  if (value === null || value === undefined) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
        N/A
      </span>
    );
  }

  const numericValue = Number(value) || 0;
  const isPositive = numericValue >= 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
        isPositive
          ? "bg-emerald-100 text-emerald-700"
          : "bg-rose-100 text-rose-700"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {formatPercent(Math.abs(numericValue))}
    </span>
  );
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
  );
}

function DashboardKpiSectionBase({ overview, comparisons, loading = false }) {
  const cards = useMemo(
    () => [
      {
        id: "operating-balance",
        label: "Solde d'operations",
        value: formatCurrency(overview.operatingBalance),
        hint: "Ventes - achats - depenses",
        trend: comparisons.operatingBalanceGrowthRate,
        Icon: HandCoins,
        tone: "from-emerald-500/15 to-emerald-50",
      },
      {
        id: "gross-profit",
        label: "Profit brut",
        value: formatCurrency(overview.grossProfit),
        hint: "Marge cumulative",
        trend: comparisons.grossProfitGrowthRate,
        Icon: CircleDollarSign,
        tone: "from-cyan-500/15 to-cyan-50",
      },
      {
        id: "margin-rate",
        label: "Taux de marge",
        value: formatPercent(overview.marginRate),
        hint: "Profit / ventes",
        trend: comparisons.marginRateGrowthRate,
        Icon: Percent,
        tone: "from-amber-500/20 to-amber-50",
      },
      {
        id: "average-order",
        label: "Panier moyen",
        value: formatCurrency(overview.averageOrderValue),
        hint: `${formatNumber(overview.totalSalesCount)} ventes`,
        trend: comparisons.averageOrderValueGrowthRate,
        Icon: ShoppingBag,
        tone: "from-indigo-500/15 to-indigo-50",
      },
      {
        id: "sell-through",
        label: "Sell-through",
        value: formatPercent(overview.sellThroughRate),
        hint: `${formatCompactNumber(overview.totalSoldItems)} vendus / stock actuel`,
        trend: comparisons.sellThroughRateGrowthRate,
        Icon: Package,
        tone: "from-sky-500/15 to-sky-50",
      },
      {
        id: "sales",
        label: "Chiffre d'affaires",
        value: formatCurrency(overview.totalSalesAmount),
        hint: `${formatNumber(overview.totalSalesCount)} ventes comptabilisees`,
        trend: comparisons.salesGrowthRate,
        Icon: ShoppingBag,
        tone: "from-teal-500/15 to-teal-50",
      },
      {
        id: "purchases",
        label: "Achats",
        value: formatCurrency(overview.totalPurchasesAmount),
        hint: `${formatNumber(overview.totalPurchasesCount)} achats comptabilises`,
        trend: comparisons.purchasesGrowthRate,
        Icon: ShoppingCart,
        tone: "from-blue-500/15 to-blue-50",
      },
      {
        id: "expenses",
        label: "Depenses payees",
        value: formatCurrency(overview.totalExpensesAmount),
        hint: `${formatNumber(overview.totalExpensesCount)} depenses comptabilisees`,
        trend: comparisons.expensesGrowthRate,
        Icon: Receipt,
        tone: "from-rose-500/15 to-rose-50",
      },
    ],
    [comparisons, overview]
  );

  if (loading) {
    return <KpiSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.Icon;

        return (
          <article
            key={card.id}
            className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${card.tone} p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold tracking-wide text-slate-700">{card.label}</p>
                <p className="mt-2 font-[var(--font-display)] text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
              <div className="rounded-xl bg-white/80 p-2.5 text-slate-800 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
              <span>{card.hint}</span>
              <KpiTrend value={card.trend} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

export const DashboardKpiSection = memo(DashboardKpiSectionBase);
