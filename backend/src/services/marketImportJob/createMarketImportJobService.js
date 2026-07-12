const prisma = require("../../lib/prisma");

async function createMarketImportJob(data) {
  const importJob = await prisma.marketImportJob.create({
    data: {
      marketProviderId: data.marketProviderId,

      status: data.status,
      source: data.source,

      fileName: data.fileName ?? null,
      fileHash: data.fileHash ?? null,

      startedAt: data.startedAt ?? undefined,
      finishedAt: data.finishedAt ?? null,

      durationMs: data.durationMs ?? null,

      cardsCreated: data.cardsCreated ?? 0,
      cardsUpdated: data.cardsUpdated ?? 0,

      providerCardsCreated: data.providerCardsCreated ?? 0,
      providerCardsUpdated: data.providerCardsUpdated ?? 0,

      snapshotsCreated: data.snapshotsCreated ?? 0,
      historyCreated: data.historyCreated ?? 0,

      referencesUpdated: data.referencesUpdated ?? 0,
      analyticsUpdated: data.analyticsUpdated ?? 0,

      errorsCount: data.errorsCount ?? 0,
      warningsCount: data.warningsCount ?? 0,
    },
  });

  return importJob;
}

module.exports = {
  createMarketImportJob,
};
