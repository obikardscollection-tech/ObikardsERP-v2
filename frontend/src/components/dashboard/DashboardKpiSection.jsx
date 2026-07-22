import { memo, useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  HandCoins,
  Package,
  Percent,
  ShoppingBag,
  Users,
} from "lucide-react";
import {
  formatCompactNumber,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "./dashboardFormatters";

function KpiTrend({ value }) {
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
        id: "net-cash-flow",
        label: "Flux net",
        value: formatCurrency(overview.netCashFlow),
        hint: "Ventes - achats - depenses",
        Icon: HandCoins,
        tone: "from-emerald-500/15 to-emerald-50",
      },
      {
        id: "gross-profit",
        label: "Profit brut",
        value: formatCurrency(overview.grossProfit),
        hint: "Marge cumulative",
        Icon: CircleDollarSign,
        tone: "from-cyan-500/15 to-cyan-50",
      },
      {
        id: "margin-rate",
        label: "Taux de marge",
        value: formatPercent(overview.marginRate),
        hint: "Profit / ventes",
        Icon: Percent,
        tone: "from-amber-500/20 to-amber-50",
      },
      {
        id: "average-order",
        label: "Panier moyen",
        value: formatCurrency(overview.averageOrderValue),
        hint: `${formatNumber(overview.totalSalesCount)} ventes`,
        Icon: ShoppingBag,
        tone: "from-indigo-500/15 to-indigo-50",
      },
      {
        id: "sell-through",
        label: "Sell-through",
        value: formatPercent(overview.sellThroughRate),
        hint: `${formatCompactNumber(overview.totalSoldItems)} articles vendus`,
        Icon: Package,
        tone: "from-sky-500/15 to-sky-50",
      },
      {
        id: "customers",
        label: "Clients actifs",
        value: formatNumber(overview.totalCustomers),
        hint: "Base client ERP",
        Icon: Users,
        tone: "from-teal-500/15 to-teal-50",
      },
    ],
    [overview]
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
              {card.id === "net-cash-flow" ? <KpiTrend value={comparisons.salesGrowthRate} /> : null}
              {card.id === "gross-profit" ? <KpiTrend value={comparisons.purchasesGrowthRate * -1} /> : null}
              {card.id === "margin-rate" ? <KpiTrend value={comparisons.expensesGrowthRate * -1} /> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export const DashboardKpiSection = memo(DashboardKpiSectionBase);
