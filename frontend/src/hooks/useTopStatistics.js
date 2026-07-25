import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getTopBrands,
  getTopCards,
  getTopPlayers,
  getTopProfit,
  getTopRoi,
  getTopSports,
  getTopSuppliers,
} from "../services/topStatisticsService";

const INITIAL_TOP_STATISTICS = {
  players: [],
  brands: [],
  sports: [],
  suppliers: [],
  cards: [],
  topRoi: [],
  topProfit: [],
};

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage;
}

function toTopData(result) {
  return Array.isArray(result?.data) ? result.data : [];
}

export default function useTopStatistics(filters = {}) {
  const [topStatistics, setTopStatistics] = useState(INITIAL_TOP_STATISTICS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const period = useMemo(() => filters?.period || "month", [filters]);

  const loadTopStatistics = useCallback(async ({ silent = false, nextFilters } = {}) => {
    const requestFilters = nextFilters || { period };

    setError("");

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const [playersResult, brandsResult, sportsResult, suppliersResult, cardsResult, topRoiResult, topProfitResult] =
      await Promise.allSettled([
        getTopPlayers(requestFilters),
        getTopBrands(requestFilters),
        getTopSports(requestFilters),
        getTopSuppliers(requestFilters),
        getTopCards(requestFilters),
        getTopRoi(requestFilters),
        getTopProfit(requestFilters),
      ]);

    const failedResults = [
      playersResult,
      brandsResult,
      sportsResult,
      suppliersResult,
      cardsResult,
      topRoiResult,
      topProfitResult,
    ].filter((result) => result.status === "rejected");

    setTopStatistics({
      players: playersResult.status === "fulfilled" ? toTopData(playersResult.value) : [],
      brands: brandsResult.status === "fulfilled" ? toTopData(brandsResult.value) : [],
      sports: sportsResult.status === "fulfilled" ? toTopData(sportsResult.value) : [],
      suppliers: suppliersResult.status === "fulfilled" ? toTopData(suppliersResult.value) : [],
      cards: cardsResult.status === "fulfilled" ? toTopData(cardsResult.value) : [],
      topRoi: topRoiResult.status === "fulfilled" ? toTopData(topRoiResult.value) : [],
      topProfit: topProfitResult.status === "fulfilled" ? toTopData(topProfitResult.value) : [],
    });

    if (failedResults.length > 0) {
      const firstError = failedResults[0]?.reason;
      setError(getErrorMessage(firstError, "Impossible de charger les tops statistiques."));
      failedResults.forEach((entry) => {
        console.error(entry.reason);
      });
    }

    setLoading(false);
    setRefreshing(false);
  }, [period]);

  const refreshTopStatistics = useCallback(async () => {
    await loadTopStatistics({ silent: true, nextFilters: { period } });
  }, [loadTopStatistics, period]);

  useEffect(() => {
    loadTopStatistics({ nextFilters: { period } });
  }, [loadTopStatistics, period]);

  return {
    topStatistics,
    topsLoading: loading,
    topsRefreshing: refreshing,
    topsError: error,
    loadTopStatistics,
    refreshTopStatistics,
  };
}
