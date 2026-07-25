import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getSalesByBrand,
  getSalesByPlatform,
  getSalesByPlayer,
  getSalesBySport,
  getSalesBySupplier,
  getSalesByYear,
} from "../services/businessStatisticsService";

const INITIAL_DISTRIBUTIONS = {
  bySport: [],
  byPlayer: [],
  byBrand: [],
  bySupplier: [],
  byPlatform: [],
  byYear: [],
};

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage;
}

function toDistributionData(result) {
  return Array.isArray(result?.data) ? result.data : [];
}

export default function useBusinessDistributions(filters = {}) {
  const [distributions, setDistributions] = useState(INITIAL_DISTRIBUTIONS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const period = useMemo(() => filters?.period || "month", [filters]);

  const loadBusinessDistributions = useCallback(async ({ silent = false, nextFilters } = {}) => {
    const requestFilters = nextFilters || { period };

    setError("");

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const [sportResult, playerResult, brandResult, supplierResult, platformResult, yearResult] = await Promise.allSettled([
      getSalesBySport(requestFilters),
      getSalesByPlayer(requestFilters),
      getSalesByBrand(requestFilters),
      getSalesBySupplier(requestFilters),
      getSalesByPlatform(requestFilters),
      getSalesByYear(requestFilters),
    ]);

    const failedResults = [
      sportResult,
      playerResult,
      brandResult,
      supplierResult,
      platformResult,
      yearResult,
    ].filter((result) => result.status === "rejected");

    setDistributions({
      bySport: sportResult.status === "fulfilled" ? toDistributionData(sportResult.value) : [],
      byPlayer: playerResult.status === "fulfilled" ? toDistributionData(playerResult.value) : [],
      byBrand: brandResult.status === "fulfilled" ? toDistributionData(brandResult.value) : [],
      bySupplier: supplierResult.status === "fulfilled" ? toDistributionData(supplierResult.value) : [],
      byPlatform: platformResult.status === "fulfilled" ? toDistributionData(platformResult.value) : [],
      byYear: yearResult.status === "fulfilled" ? toDistributionData(yearResult.value) : [],
    });

    if (failedResults.length > 0) {
      const firstError = failedResults[0]?.reason;
      setError(getErrorMessage(firstError, "Impossible de charger les distributions business."));
      failedResults.forEach((entry) => {
        console.error(entry.reason);
      });
    }

    setLoading(false);
    setRefreshing(false);
  }, [period]);

  const refreshBusinessDistributions = useCallback(async () => {
    await loadBusinessDistributions({ silent: true, nextFilters: { period } });
  }, [loadBusinessDistributions, period]);

  useEffect(() => {
    loadBusinessDistributions({ nextFilters: { period } });
  }, [loadBusinessDistributions, period]);

  return {
    distributions,
    businessLoading: loading,
    businessRefreshing: refreshing,
    businessError: error,
    loadBusinessDistributions,
    refreshBusinessDistributions,
  };
}
