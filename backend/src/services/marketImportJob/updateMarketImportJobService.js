const prisma = require("../../lib/prisma");

async function updateMarketImportJob(id, data) {
  const importJob = await prisma.marketImportJob.findUnique({
    where: {
      id,
    },
  });

  if (!importJob) {
    throw new Error("MarketImportJob introuvable.");
  }

  const updatedImportJob = await prisma.marketImportJob.update({
    where: {
      id,
    },
    data: {
      marketProviderId: data.marketProviderId,

      status: data.status,
      source: data.source,

      fileName: data.fileName,
      fileHash: data.fileHash,

      startedAt: data.startedAt,
      finishedAt: data.finishedAt,

      durationMs: data.durationMs,

      cardsCreated: data.cardsCreated,
      cardsUpdated: data.cardsUpdated,

      providerCardsCreated: data.providerCardsCreated,
      providerCardsUpdated: data.providerCardsUpdated,

      snapshotsCreated: data.snapshotsCreated,
      historyCreated: data.historyCreated,

      referencesUpdated: data.referencesUpdated,
      analyticsUpdated: data.analyticsUpdated,

      errorsCount: data.errorsCount,
      warningsCount: data.warningsCount,
    },
  });

  return updatedImportJob;
}

module.exports = {
  updateMarketImportJob,
};
