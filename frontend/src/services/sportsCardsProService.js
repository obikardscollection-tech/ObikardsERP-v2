import api from "./api";

const SPORTS_CARDS_PRO_CODE = "SPORTSCARDSPRO";
const IMPORT_JOBS_API_URL = "/market/import-jobs";
const IMPORT_ERRORS_API_URL = "/market/import-errors";
const HISTORY_PAGE_SIZE = 200;
const ERRORS_PAGE_SIZE = 500;

function toErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

export async function getSportsCardsProStatistics() {
  try {
    const response = await api.get(`${IMPORT_JOBS_API_URL}/stats/sportscardspro`);
    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error, "Erreur lors du chargement des statistiques SportsCardsPro."));
  }
}

export async function getSportsCardsProImportJobs() {
  try {
    const response = await api.get(IMPORT_JOBS_API_URL, {
      params: {
        providerCode: SPORTS_CARDS_PRO_CODE,
        take: HISTORY_PAGE_SIZE,
      },
    });

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw new Error(toErrorMessage(error, "Erreur lors du chargement de l'historique des imports."));
  }
}

export async function getSportsCardsProImportErrors() {
  try {
    const response = await api.get(IMPORT_ERRORS_API_URL, {
      params: {
        providerCode: SPORTS_CARDS_PRO_CODE,
        take: ERRORS_PAGE_SIZE,
      },
    });

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw new Error(toErrorMessage(error, "Erreur lors du chargement des erreurs d'import."));
  }
}

export async function startSportsCardsProSynchronization(payload = {}) {
  try {
    const response = await api.post(`${IMPORT_JOBS_API_URL}/sync/sportscardspro`, payload);
    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error, "Erreur lors du lancement de la synchronisation SportsCardsPro."));
  }
}

export async function syncSingleSportsCardsProCard(payload = {}) {
  try {
    const response = await api.post(`${IMPORT_JOBS_API_URL}/sync/sportscardspro/single`, payload);
    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error, "Erreur lors de la synchronisation de la carte SportsCardsPro."));
  }
}

export function filterSportsCardsProData(statistics, jobs, errors) {
  if (!statistics || statistics.providerCode !== SPORTS_CARDS_PRO_CODE) {
    return {
      jobs: [],
      errors: [],
    };
  }

  const providerId = statistics?.lastJob?.marketProviderId || null;

  if (!providerId) {
    return {
      jobs,
      errors,
    };
  }

  const providerJobs = jobs.filter((job) => job.marketProviderId === providerId);
  const providerJobIds = new Set(providerJobs.map((job) => job.id));
  const providerErrors = errors.filter((entry) => providerJobIds.has(entry.marketImportJobId));

  return {
    jobs: providerJobs,
    errors: providerErrors,
  };
}
