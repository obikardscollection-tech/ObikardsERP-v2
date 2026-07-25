import { useCallback, useEffect, useMemo, useState } from "react";

import { getMarketStatistics } from "../services/marketStatisticsService";

const INITIAL_MARKET_STATISTICS = {
  range: null,
  granularity: "day",
  provider: "",
  dataAvailable: false,
  evolutionPrixMoyen: {
    available: false,
    data: [],
  },
  evolutionValeurMarche: {
    available: false,
    data: [],
  },
  variationRoi: {
    available: false,
    data: [],
  },
  cartesEnHausse: [],
  cartesEnBaisse: [],
  potentielRevente: [],
  potentielInvestissement: [],
};

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage;
}

export default function useMarketStatistics(filters = {}) {
  const [marketStatistics, setMarketStatistics] = useState(INITIAL_MARKET_STATISTICS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const period = useMemo(() => filters?.period || "month", [filters]);

  const loadMarketStatistics = useCallback(async ({ silent = false, nextFilters } = {}) => {
    const requestFilters = nextFilters || { period };

    setError("");

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getMarketStatistics(requestFilters);

      setMarketStatistics({
        ...INITIAL_MARKET_STATISTICS,
        ...response,
        evolutionPrixMoyen: {
          ...INITIAL_MARKET_STATISTICS.evolutionPrixMoyen,
          ...response?.evolutionPrixMoyen,
          data: Array.isArray(response?.evolutionPrixMoyen?.data)
            ? response.evolutionPrixMoyen.data
            : [],
        },
        evolutionValeurMarche: {
          ...INITIAL_MARKET_STATISTICS.evolutionValeurMarche,
          ...response?.evolutionValeurMarche,
          data: Array.isArray(response?.evolutionValeurMarche?.data)
            ? response.evolutionValeurMarche.data
            : [],
        },
        variationRoi: {
          ...INITIAL_MARKET_STATISTICS.variationRoi,
          ...response?.variationRoi,
          data: Array.isArray(response?.variationRoi?.data) ? response.variationRoi.data : [],
        },
        cartesEnHausse: Array.isArray(response?.cartesEnHausse) ? response.cartesEnHausse : [],
        cartesEnBaisse: Array.isArray(response?.cartesEnBaisse) ? response.cartesEnBaisse : [],
        potentielRevente: Array.isArray(response?.potentielRevente) ? response.potentielRevente : [],
        potentielInvestissement: Array.isArray(response?.potentielInvestissement)
          ? response.potentielInvestissement
          : [],
      });
    } catch (requestError) {
      console.error(requestError);
      setMarketStatistics(INITIAL_MARKET_STATISTICS);
      setError(getErrorMessage(requestError, "Impossible de charger les statistiques market."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  const refreshMarketStatistics = useCallback(async () => {
    await loadMarketStatistics({ silent: true, nextFilters: { period } });
  }, [loadMarketStatistics, period]);

  useEffect(() => {
    loadMarketStatistics({ nextFilters: { period } });
  }, [loadMarketStatistics, period]);

  return {
    marketStatistics,
    marketLoading: loading,
    marketRefreshing: refreshing,
    marketError: error,
    loadMarketStatistics,
    refreshMarketStatistics,
  };
}
