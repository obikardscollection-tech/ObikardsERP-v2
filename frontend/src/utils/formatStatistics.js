function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatNumber(value) {
  return safeNumber(value).toLocaleString("fr-FR");
}

export function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("fr-FR");
}

export function resolveGlobalStatus(statistics) {
  if (safeNumber(statistics?.runningJobs) > 0) {
    return "RUNNING";
  }

  const lastStatus = statistics?.lastJob?.status || null;

  if (lastStatus === "SUCCESS" || lastStatus === "FAILED" || lastStatus === "RUNNING") {
    return lastStatus;
  }

  return "PENDING";
}

export function mapStatisticsToKpis(statistics) {
  return [
    {
      key: "cardsCreated",
      label: "Nouvelles cartes",
      value: safeNumber(statistics?.totalCardsCreated),
    },
    {
      key: "cardsUpdated",
      label: "Cartes mises a jour",
      value: safeNumber(statistics?.totalCardsUpdated),
    },
    {
      key: "providerCardsCreated",
      label: "Provider cards creees",
      value: safeNumber(statistics?.totalProviderCardsCreated),
    },
    {
      key: "providerCardsUpdated",
      label: "Provider cards mises a jour",
      value: safeNumber(statistics?.totalProviderCardsUpdated),
    },
    {
      key: "snapshotsCreated",
      label: "Snapshots crees",
      value: safeNumber(statistics?.totalSnapshotsCreated),
    },
    {
      key: "historyCreated",
      label: "Historique cree",
      value: safeNumber(statistics?.totalHistoryCreated),
    },
    {
      key: "analyzedRows",
      label: "Lignes analysees",
      value: safeNumber(statistics?.totalRows),
    },
    {
      key: "processedRows",
      label: "Lignes traitees",
      value: safeNumber(statistics?.totalProcessedRows),
    },
    {
      key: "ignoredRows",
      label: "Lignes ignorees",
      value: safeNumber(statistics?.totalSkippedRows),
    },
    {
      key: "errorsCount",
      label: "Erreurs",
      value: safeNumber(statistics?.totalErrors),
    },
  ];
}
