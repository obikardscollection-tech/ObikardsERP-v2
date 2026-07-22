import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getStockDistribution,
  getStockStatistics,
} from "../services/statisticsService";

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

export default function useStatistics(initialFilters = { period: "30d" }) {
  const [filters, setFilters] = useState(initialFilters);
  const [statistics, setStatistics] = useState(INITIAL_STATE);
  const [distribution, setDistribution] = useState(INITIAL_DISTRIBUTION);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadStatistics = useCallback(async ({ silent = false, nextFilters } = {}) => {
    const requestFilters = nextFilters || filters;

    try {
      setError("");

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [statsData, distributionData] = await Promise.all([
        getStockStatistics(requestFilters),
        getStockDistribution(requestFilters),
      ]);

      setStatistics({
        ...INITIAL_STATE,
        ...statsData,
      });

      setDistribution({
        ...INITIAL_DISTRIBUTION,
        ...distributionData,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const period = useMemo(() => filters?.period || "30d", [filters]);

  const updatePeriod = useCallback((nextPeriod) => {
    setFilters((previous) => ({
      ...previous,
      period: nextPeriod,
    }));
  }, []);

  const refresh = useCallback(async () => {
    await loadStatistics({ silent: true });
  }, [loadStatistics]);

  return {
    filters,
    period,
    statistics,
    distribution,
    loading,
    refreshing,
    error,
    loadStatistics,
    updatePeriod,
    refresh,
  };
}