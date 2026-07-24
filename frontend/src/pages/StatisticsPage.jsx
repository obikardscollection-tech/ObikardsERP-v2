import Sidebar from "../components/layout/Sidebar";
import FinanceKpiGrid from "../components/statistics/FinanceKpiGrid";
import StatisticsSection from "../components/statistics/StatisticsSection";
import StatisticsFilters from "../components/statistics/StatisticsFilters";
import StockByBrandTable from "../components/statistics/StockByBrandTable";
import StockBySportTable from "../components/statistics/StockBySportTable";
import StockDistributionCharts from "../components/statistics/StockDistributionCharts";
import StockMetricsCards from "../components/statistics/StockMetricsCards";
import useStatistics from "../hooks/useStatistics";

function StatisticsPage() {
  const {
    period,
    statistics,
    distribution,
    financialTemporal,
    loading,
    refreshing,
    financeLoading,
    financeError,
    stockError,
    updatePeriod,
    refresh,
  } = useStatistics({ period: "month" });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Statistiques</h1>
            <p className="mt-1 text-sm text-slate-500">Analyse finance et stock par periode.</p>
          </div>
        </div>

        <div className="space-y-6">
          <StatisticsFilters
            period={period}
            onPeriodChange={updatePeriod}
            onRefresh={refresh}
            loading={loading}
            refreshing={refreshing}
          />

          <StatisticsSection
            title="Finance"
            subtitle="Les valeurs, variations et comparaisons proviennent exclusivement du backend."
            loading={financeLoading}
            error={financeError}
            loadingContent={<FinanceKpiGrid data={financialTemporal} loading />}
            errorContent={<FinanceKpiGrid data={financialTemporal} error={financeError} />}
          >
            <FinanceKpiGrid data={financialTemporal} />
          </StatisticsSection>

          {stockError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              {stockError}
            </div>
          ) : null}

          <StockMetricsCards metrics={statistics.metrics} />

          <StockDistributionCharts distribution={distribution} />

          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
            <StockBySportTable stockData={statistics.stockParSport} />
            <StockByBrandTable stockData={statistics.stockParMarque} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default StatisticsPage;