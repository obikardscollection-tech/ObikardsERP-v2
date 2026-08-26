import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  filterSportsCardsProData,
  getSportsCardsProImportErrors,
  getSportsCardsProImportJobs,
  getSportsCardsProStatistics,
  startSportsCardsProSynchronization,
  syncSingleSportsCardsProCard,
} from "../services/sportsCardsProService";
import { resolveGlobalStatus } from "../utils/formatStatistics";

const REFRESH_IDLE_MS = 30000;
const REFRESH_RUNNING_MS = 8000;

function toMessage(error, fallback) {
  return error?.message || fallback;
}

export default function useSportsCardsPro() {
  const [statistics, setStatistics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [errors, setErrors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [singleCardSyncing, setSingleCardSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [singleCardMessage, setSingleCardMessage] = useState("");
  const [singleCardError, setSingleCardError] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const requestIdRef = useRef(0);
  const isLoadInFlightRef = useRef(false);

  const load = useCallback(async ({ manual = false } = {}) => {
    if (isLoadInFlightRef.current) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    isLoadInFlightRef.current = true;

    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage("");

    try {
      const [statsData, jobsData, errorsData] = await Promise.all([
        getSportsCardsProStatistics(),
        getSportsCardsProImportJobs(),
        getSportsCardsProImportErrors(),
      ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      const filtered = filterSportsCardsProData(statsData, jobsData, errorsData);

      setStatistics(statsData);
      setJobs(filtered.jobs);
      setErrors(filtered.errors);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setErrorMessage(toMessage(error, "Erreur lors du chargement SportsCardsPro."));
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }

      isLoadInFlightRef.current = false;
    }
  }, []);

  const handleOpenDialog = useCallback(() => {
    if (syncing) {
      return;
    }

    setIsDialogOpen(true);
  }, [syncing]);

  const handleCloseDialog = useCallback(() => {
    if (syncing) {
      return;
    }

    setIsDialogOpen(false);
  }, [syncing]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((current) => ({
      ...current,
      open: false,
    }));
  }, []);

  const startSynchronization = useCallback(async () => {
    if (syncing) {
      return;
    }

    setSyncing(true);
    setIsDialogOpen(true);

    try {
      await startSportsCardsProSynchronization();
      setSnackbar({
        open: true,
        severity: "success",
        message: "Synchronisation SportsCardsPro lancee avec succes.",
      });
      await load({ manual: true });
    } catch (error) {
      setSnackbar({
        open: true,
        severity: "error",
        message: toMessage(error, "Impossible de lancer la synchronisation."),
      });
    } finally {
      setSyncing(false);
      setIsDialogOpen(false);
    }
  }, [load, syncing]);

  const handleSyncSingleCard = useCallback(async (payload = {}) => {
    if (singleCardSyncing) {
      return null;
    }

    setSingleCardSyncing(true);
    setSingleCardError("");
    setSingleCardMessage("");

    try {
      const result = await syncSingleSportsCardsProCard(payload);
      setSingleCardMessage(result?.message || "Carte SportsCardsPro synchronisee.");
      await load({ manual: true });
      return result;
    } catch (error) {
      const message = toMessage(error, "Impossible de synchroniser la carte SportsCardsPro.");
      setSingleCardError(message);
      throw error;
    } finally {
      setSingleCardSyncing(false);
    }
  }, [load, singleCardSyncing]);

  const currentStatus = useMemo(() => resolveGlobalStatus(statistics), [statistics]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const refreshDelay = currentStatus === "RUNNING" || syncing
      ? REFRESH_RUNNING_MS
      : REFRESH_IDLE_MS;

    const intervalId = setInterval(() => {
      load({ manual: true });
    }, refreshDelay);

    return () => {
      clearInterval(intervalId);
    };
  }, [currentStatus, load, syncing]);

  return {
    statistics,
    jobs,
    errors,
    loading,
    refreshing,
    syncing,
    singleCardSyncing,
    currentStatus,
    errorMessage,
    singleCardMessage,
    singleCardError,
    isDialogOpen,
    snackbar,
    load,
    handleOpenDialog,
    handleCloseDialog,
    handleCloseSnackbar,
    startSynchronization,
    handleSyncSingleCard,
  };
}
