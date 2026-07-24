import { useCallback, useEffect, useState } from "react";

import { getFinancialTemporalAnalysis } from "../services/statisticsService";

export const INITIAL_FINANCIAL_TEMPORAL = {
  range: null,
  previousRange: null,
  current: {
    chiffreAffairesHT: 0,
    chiffreAffairesTTC: 0,
    coutAchat: 0,
    beneficeBrut: 0,
    beneficeNet: 0,
    roiPct: 0,
    margePct: 0,
    ticketMoyen: 0,
    panierMoyen: 0,
  },
  previous: {
    chiffreAffairesHT: 0,
    chiffreAffairesTTC: 0,
    coutAchat: 0,
    beneficeBrut: 0,
    beneficeNet: 0,
    roiPct: 0,
    margePct: 0,
    ticketMoyen: 0,
    panierMoyen: 0,
  },
  comparaison: {
    chiffreAffairesHT: 0,
    chiffreAffairesTTC: 0,
    coutAchat: 0,
    beneficeBrut: 0,
    beneficeNet: 0,
    roiPct: 0,
    margePct: 0,
    ticketMoyen: 0,
    panierMoyen: 0,
  },
};

export const SUPPORTED_PERIOD_FALLBACK = "month";

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage;
}

function getFinanceSlice(period, temporalData) {
  if (!temporalData || typeof temporalData !== "object") {
    return INITIAL_FINANCIAL_TEMPORAL;
  }

  const nextSlice = temporalData[period];

  if (!nextSlice) {
    return INITIAL_FINANCIAL_TEMPORAL;
  }

  return {
    ...INITIAL_FINANCIAL_TEMPORAL,
    ...nextSlice,
    current: {
      ...INITIAL_FINANCIAL_TEMPORAL.current,
      ...nextSlice.current,
    },
    previous: {
      ...INITIAL_FINANCIAL_TEMPORAL.previous,
      ...nextSlice.previous,
    },
    comparaison: {
      ...INITIAL_FINANCIAL_TEMPORAL.comparaison,
      ...nextSlice.comparaison,
    },
  };
}

export default function useFinanceStatistics(filters = { period: SUPPORTED_PERIOD_FALLBACK }, options = {}) {
  const { autoLoad = true } = options;
  const [financialTemporal, setFinancialTemporal] = useState(INITIAL_FINANCIAL_TEMPORAL);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadFinanceStatistics = useCallback(async ({ silent = false, nextFilters } = {}) => {
    const requestFilters = nextFilters || filters;

    setError("");

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getFinancialTemporalAnalysis(requestFilters);
      setFinancialTemporal(getFinanceSlice(requestFilters.period || SUPPORTED_PERIOD_FALLBACK, response));
    } catch (requestError) {
      console.error(requestError);
      setFinancialTemporal(INITIAL_FINANCIAL_TEMPORAL);
      setError(getErrorMessage(requestError, "Impossible de charger les indicateurs financiers."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    loadFinanceStatistics();
  }, [autoLoad, loadFinanceStatistics]);

  return {
    financialTemporal,
    financeLoading: loading,
    financeRefreshing: refreshing,
    financeError: error,
    loadFinanceStatistics,
  };
}