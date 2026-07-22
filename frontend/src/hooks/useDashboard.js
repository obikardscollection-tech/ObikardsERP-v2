import { useState, useEffect, useCallback, useRef } from "react";
import { getDashboardData } from "../services/dashboardService";

const INITIAL_DATA = {
  filters: {
    applied: {
      period: "30d",
      from: null,
      to: null,
      granularity: "day",
    },
    supportedPeriods: ["7d", "30d", "90d", "365d", "custom"],
    supportedGranularity: ["day", "week", "month"],
  },
  overview: {
    totalItems: 0,
    totalQuantity: 0,
    estimatedStockValue: 0,
    totalSalesCount: 0,
    totalSalesAmount: 0,
    totalSoldItems: 0,
    totalPurchasesCount: 0,
    totalPurchasesAmount: 0,
    totalExpensesCount: 0,
    totalExpensesAmount: 0,
    totalCustomers: 0,
    grossProfit: 0,
    netCashFlow: 0,
    averageOrderValue: 0,
    marginRate: 0,
    sellThroughRate: 0,
    activeSportsCount: 0,
    activeSalesPlatformsCount: 0,
    activePurchasePlatformsCount: 0,
  },
  comparisons: {
    salesGrowthRate: 0,
    purchasesGrowthRate: 0,
    expensesGrowthRate: 0,
  },
  charts: {
    financeTimeline: [],
    transactionsByType: {
      sales: 0,
      purchases: 0,
      expenses: 0,
    },
  },
  breakdowns: {
    salesByPlatform: [],
    purchasesByPlatform: [],
    inventoryBySport: [],
    salesBySport: [],
  },
  recentActivity: [],
  alerts: [],
  generatedAt: null,
};

export function useDashboard(filters = {}) {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [data, setData] = useState(INITIAL_DATA);
  const requestIdRef = useRef(0);
  const hasLoadedOnceRef = useRef(false);

  const loadDashboard = useCallback(async ({ isManualRefresh = false, requestFilters = filters } = {}) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      if (hasLoadedOnceRef.current && isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const dashboardData = await getDashboardData(requestFilters);

      if (requestId === requestIdRef.current) {
        setData({
          ...INITIAL_DATA,
          ...dashboardData,
        });
        hasLoadedOnceRef.current = true;
        setHasLoadedOnce(true);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err.message || "Erreur lors du chargement du tableau de bord");
      }
      console.error("Dashboard error:", err);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [filters]);

  const refresh = useCallback(async (requestFilters = filters) => {
    await loadDashboard({ isManualRefresh: true, requestFilters });
  }, [filters, loadDashboard]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard, filters]);

  return {
    loading,
    isRefreshing,
    hasLoadedOnce,
    error,
    data,
    refresh,
  };
}
