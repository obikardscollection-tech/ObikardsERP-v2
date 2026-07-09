import { useState, useEffect, useCallback } from "react";
import { getDashboardData } from "../services/dashboardService";

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    stats: {
      stockValue: 0,
      stockCount: 0,
      saleCount: 0,
      purchaseCount: 0,
      expenseCount: 0,
      customerCount: 0,
    },
    cards: {
      revenue: 0,
      expenses: 0,
      margin: 0,
      marginPercent: 0,
      itemsSold: 0,
      purchasesThisMonth: 0,
    },
    recentSales: [],
    recentPurchases: [],
    recentExpenses: [],
    lowStockItems: [],
    expensesByCategory: {},
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
