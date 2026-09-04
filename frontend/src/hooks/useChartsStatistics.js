import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getChartsOverview,
} from "../services/chartsStatisticsService";

const INITIAL_CHARTS = {
  revenue: [],
  profit: [],
  roi: [],
  purchases: {
    data: [],
    quantites: [],
  },
  expenses: {
    data: [],
    ht: [],
    taxes: [],
    count: [],
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
    expensesByCategory: [],
  },
};

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage;
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

    try {
      const result = await getChartsOverview(requestFilters);
      setCharts({
        ...INITIAL_CHARTS,
        ...result,
      });
    } catch (requestError) {
      console.error(requestError);
      setCharts(INITIAL_CHARTS);
      setError(getErrorMessage(requestError, "Impossible de charger les charts statistiques."));
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
