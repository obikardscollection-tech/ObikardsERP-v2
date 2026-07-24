import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getStockDistribution,
  getStockStatistics,
} from "../services/statisticsService";
import useFinanceStatistics, { SUPPORTED_PERIOD_FALLBACK } from "./useFinanceStatistics";

const INITIAL_STATE = {
  metrics: {
    nombreTotalCartes: 0,
    quantiteTotale: 0,
    valeurAchatStock: 0,
    valeurVenteStock: 0,
    valeurMarcheStock: 0,
    beneficePotentiel: 0,
    roiPotentiel: 0,
    rotationStock: 0,
  },
  stockParSport: [],
  stockParMarque: [],
};

const INITIAL_DISTRIBUTION = {
  bySport: [],
  byBrand: [],
};

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage;
}

export default function useStatistics(initialFilters = { period: SUPPORTED_PERIOD_FALLBACK }) {
  const [filters, setFilters] = useState(initialFilters);
  const [statistics, setStatistics] = useState(INITIAL_STATE);
  const [distribution, setDistribution] = useState(INITIAL_DISTRIBUTION);
  const [loadingState, setLoadingState] = useState({ stock: true });
  const [refreshingState, setRefreshingState] = useState({ stock: false });
  const [errors, setErrors] = useState({ stock: "" });

  const {
    financialTemporal,
    financeLoading,
    financeRefreshing,
    financeError,
    loadFinanceStatistics,
  } = useFinanceStatistics(filters, { autoLoad: false });

  const loadStockStatistics = useCallback(async ({ silent = false, nextFilters } = {}) => {
    const requestFilters = nextFilters || filters;

    setErrors({ stock: "" });

    if (silent) {
      setRefreshingState({ stock: true });
    } else {
      setLoadingState({ stock: true });
    }

    const [statsResult, distributionResult] = await Promise.allSettled([
      getStockStatistics(requestFilters),
      getStockDistribution(requestFilters),
    ]);

    if (statsResult.status === "fulfilled") {
      setStatistics({
        ...INITIAL_STATE,
        ...statsResult.value,
      });
    } else {
      console.error(statsResult.reason);
      setStatistics(INITIAL_STATE);
    }

    if (distributionResult.status === "fulfilled") {
      setDistribution({
        ...INITIAL_DISTRIBUTION,
        ...distributionResult.value,
      });
    } else {
      console.error(distributionResult.reason);
      setDistribution(INITIAL_DISTRIBUTION);
    }

    setErrors({
      stock:
        statsResult.status === "rejected" || distributionResult.status === "rejected"
          ? getErrorMessage(
              statsResult.status === "rejected" ? statsResult.reason : distributionResult.reason,
              "Impossible de charger les statistiques de stock."
            )
          : "",
    });

    setLoadingState({ stock: false });
    setRefreshingState({ stock: false });
  }, [filters]);

  const loadStatistics = useCallback(async ({ silent = false, nextFilters } = {}) => {
    await Promise.all([
      loadStockStatistics({ silent, nextFilters }),
      loadFinanceStatistics({ silent, nextFilters }),
    ]);
  }, [loadFinanceStatistics, loadStockStatistics]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const period = useMemo(() => filters?.period || SUPPORTED_PERIOD_FALLBACK, [filters]);

  const updatePeriod = useCallback((nextPeriod) => {
    setFilters((previous) => ({
      ...previous,
      period: nextPeriod,
    }));
  }, []);

  const refresh = useCallback(async () => {
    await loadStatistics({ silent: true });
  }, [loadFinanceStatistics, loadStatistics]);

  return {
    filters,
    period,
    statistics,
    distribution,
    financialTemporal,
    loading: loadingState.stock || financeLoading,
    refreshing: refreshingState.stock || financeRefreshing,
    stockLoading: loadingState.stock,
    financeLoading,
    stockRefreshing: refreshingState.stock,
    financeRefreshing,
    stockError: errors.stock,
    financeError,
    loadStatistics,
    updatePeriod,
    refresh,
  };
}