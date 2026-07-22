import { useState, useEffect, useCallback } from "react";
import { getDashboardData } from "../services/dashboardService";

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
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
    },
    recentActivity: [],
    alerts: [],
    generatedAt: null,
  });

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement du tableau de bord");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    loading,
    error,
    data,
    refresh,
  };
}
