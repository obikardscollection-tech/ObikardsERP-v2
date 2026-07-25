import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getBenefitsDistribution,
  getProfitEvolution,
  getPurchasesEvolution,
  getRevenueEvolution,
  getRoiEvolution,
  getSalesDistribution,
  getSalesEvolution,
  getStockEvolution,
} from "../services/chartsStatisticsService";

const INITIAL_CHARTS = {
  revenue: [],
  profit: [],
  roi: [],
  purchases: {
    data: [],
    quantites: [],
  },
  sales: [],
  stock: {
    data: [],
    net: [],
    entries: [],
    outputs: [],
  },
  distributions: {
    salesByPlatform: [],
    salesByStatus: [],
    benefitsBySport: [],
    benefitsByBrand: [],
    benefitsBySupplier: [],
  },
};

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage;
}

function toChartData(result) {
  return Array.isArray(result?.data) ? result.data : [];
}

export default function useChartsStatistics(filters = {}) {
  const [charts, setCharts] = useState(INITIAL_CHARTS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const period = useMemo(() => filters?.period || "month", [filters]);

  const loadChartsStatistics = useCallback(async ({ silent = false, nextFilters } = {}) => {
    const requestFilters = nextFilters || { period };

    setError("");

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const [
      revenueResult,
      profitResult,
      roiResult,
      purchasesResult,
      salesResult,
      stockResult,
      salesDistributionResult,
      benefitsDistributionResult,
    ] = await Promise.allSettled([
      getRevenueEvolution(requestFilters),
      getProfitEvolution(requestFilters),
      getRoiEvolution(requestFilters),
      getPurchasesEvolution(requestFilters),
      getSalesEvolution(requestFilters),
      getStockEvolution(requestFilters),
      getSalesDistribution(requestFilters),
      getBenefitsDistribution(requestFilters),
    ]);

    const results = [
      revenueResult,
      profitResult,
      roiResult,
      purchasesResult,
      salesResult,
      stockResult,
      salesDistributionResult,
      benefitsDistributionResult,
    ];

    const failedResults = results.filter((result) => result.status === "rejected");

    setCharts({
      revenue: revenueResult.status === "fulfilled" ? toChartData(revenueResult.value) : [],
      profit: profitResult.status === "fulfilled" ? toChartData(profitResult.value) : [],
      roi: roiResult.status === "fulfilled" ? toChartData(roiResult.value) : [],
      purchases: {
        data: purchasesResult.status === "fulfilled" ? toChartData(purchasesResult.value) : [],
        quantites:
          purchasesResult.status === "fulfilled"
            ? toChartData(purchasesResult.value?.meta?.quantites)
            : [],
      },
      sales: salesResult.status === "fulfilled" ? toChartData(salesResult.value) : [],
      stock: {
        data: stockResult.status === "fulfilled" ? toChartData(stockResult.value) : [],
        net: stockResult.status === "fulfilled" ? toChartData(stockResult.value?.meta?.net) : [],
        entries:
          stockResult.status === "fulfilled" ? toChartData(stockResult.value?.meta?.entries) : [],
        outputs:
          stockResult.status === "fulfilled" ? toChartData(stockResult.value?.meta?.outputs) : [],
      },
      distributions: {
        salesByPlatform:
          salesDistributionResult.status === "fulfilled"
            ? toChartData(salesDistributionResult.value?.byPlatform)
            : [],
        salesByStatus:
          salesDistributionResult.status === "fulfilled"
            ? toChartData(salesDistributionResult.value?.byStatus)
            : [],
        benefitsBySport:
          benefitsDistributionResult.status === "fulfilled"
            ? toChartData(benefitsDistributionResult.value?.bySport)
            : [],
        benefitsByBrand:
          benefitsDistributionResult.status === "fulfilled"
            ? toChartData(benefitsDistributionResult.value?.byBrand)
            : [],
        benefitsBySupplier:
          benefitsDistributionResult.status === "fulfilled"
            ? toChartData(benefitsDistributionResult.value?.bySupplier)
            : [],
      },
    });

    if (failedResults.length > 0) {
      const firstError = failedResults[0]?.reason;
      setError(getErrorMessage(firstError, "Impossible de charger les charts statistiques."));
      failedResults.forEach((entry) => {
        console.error(entry.reason);
      });
    }

    setLoading(false);
    setRefreshing(false);
  }, [period]);

  const refreshChartsStatistics = useCallback(async () => {
    await loadChartsStatistics({ silent: true, nextFilters: { period } });
  }, [loadChartsStatistics, period]);

  useEffect(() => {
    loadChartsStatistics({ nextFilters: { period } });
  }, [loadChartsStatistics, period]);

  return {
    charts,
    chartsLoading: loading,
    chartsRefreshing: refreshing,
    chartsError: error,
    loadChartsStatistics,
    refreshChartsStatistics,
  };
}
