import { useCallback, useEffect, useMemo, useState } from "react";

import { getBusinessDistributions } from "../services/businessStatisticsService";

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

    try {
      const result = await getBusinessDistributions(requestFilters);
      setDistributions({
        ...INITIAL_DISTRIBUTIONS,
        ...result.distributions,
      });
    } catch (requestError) {
      console.error(requestError);
      setDistributions(INITIAL_DISTRIBUTIONS);
      setError(getErrorMessage(requestError, "Impossible de charger les distributions business."));
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
