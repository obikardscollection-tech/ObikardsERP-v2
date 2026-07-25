import DistributionCharts from "./DistributionCharts";
import ProfitChart from "./ProfitChart";
import PurchasesChart from "./PurchasesChart";
import RevenueChart from "./RevenueChart";
import RoiChart from "./RoiChart";
import SalesChart from "./SalesChart";
import StockChart from "./StockChart";

function LoadingChartsGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <article key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-56 rounded bg-slate-200" />
            <div className="h-3 w-full rounded bg-slate-200" />
            <div className="h-3 w-full rounded bg-slate-200" />
            <div className="h-3 w-2/3 rounded bg-slate-200" />
          </div>
        </article>
      ))}
    </div>
  );
}

export default function ChartsSection({ charts, loading = false, error = "" }) {
  if (loading) {
    return <LoadingChartsGrid />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
        <RevenueChart data={charts.revenue} />
        <ProfitChart data={charts.profit} />
        <RoiChart data={charts.roi} />
        <PurchasesChart data={charts.purchases.data} quantites={charts.purchases.quantites} />
        <SalesChart data={charts.sales} />
        <StockChart
          data={charts.stock.data}
          net={charts.stock.net}
          entries={charts.stock.entries}
          outputs={charts.stock.outputs}
        />
      </div>

      <DistributionCharts distributions={charts.distributions} />
    </div>
  );
}
