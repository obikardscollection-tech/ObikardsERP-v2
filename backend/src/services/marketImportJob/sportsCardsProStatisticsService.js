const prisma = require("../../lib/prisma");
const { SPORTS_CARDS_PRO_PROVIDER, IMPORT_STATUS } = require("./sportsCardsProConstants");

function createStatistics() {
  return {
    totalRows: 0,
    processedRows: 0,
    skippedRows: 0,
    cardsCreated: 0,
    cardsUpdated: 0,
    providerCardsCreated: 0,
    providerCardsUpdated: 0,
    snapshotsCreated: 0,
    snapshotsUpdated: 0,
    snapshotsUnchanged: 0,
    historyCreated: 0,
    referencesUpdated: 0,
    analyticsUpdated: 0,
    errorsCount: 0,
    warningsCount: 0,
  };
}

function createEmptySummary(providerCode) {
  return {
    providerCode,
    totalJobs: 0,
    successfulJobs: 0,
    failedJobs: 0,
    runningJobs: 0,
    totalCardsCreated: 0,
    totalCardsUpdated: 0,
    totalProviderCardsCreated: 0,
    totalProviderCardsUpdated: 0,
    totalRows: 0,
    totalProcessedRows: 0,
    totalSkippedRows: 0,
    totalSnapshotsCreated: 0,
    totalHistoryCreated: 0,
    totalErrors: 0,
    lastRunAt: null,
    lastSuccessAt: null,
    lastImportDurationMs: null,
    lastImportTotalRows: 0,
    lastImportProcessedRows: 0,
    lastImportSkippedRows: 0,
    lastImportCardsCreated: 0,
    lastImportCardsUpdated: 0,
    lastImportSnapshotsCreated: 0,
    lastImportErrorsCount: 0,
    lastJob: null,
  };
}

async function getSportsCardsProSyncStatistics() {
  const provider = await prisma.marketProvider.findUnique({
    where: {
      code: SPORTS_CARDS_PRO_PROVIDER.CODE,
    },
  });

  if (!provider) {
    return createEmptySummary(SPORTS_CARDS_PRO_PROVIDER.CODE);
  }

  const [jobs, successCount, failedCount, runningCount, aggregate, latestJob, latestSuccessJob] =
    await Promise.all([
      prisma.marketImportJob.count({
        where: {
          marketProviderId: provider.id,
        },
      }),
      prisma.marketImportJob.count({
        where: {
          marketProviderId: provider.id,
          status: IMPORT_STATUS.SUCCESS,
        },
      }),
      prisma.marketImportJob.count({
        where: {
          marketProviderId: provider.id,
          status: IMPORT_STATUS.FAILED,
        },
      }),
      prisma.marketImportJob.count({
        where: {
          marketProviderId: provider.id,
          status: IMPORT_STATUS.RUNNING,
        },
      }),
      prisma.marketImportJob.aggregate({
        where: {
          marketProviderId: provider.id,
        },
        _sum: {
          totalRows: true,
          processedRows: true,
          skippedRows: true,
          cardsCreated: true,
          cardsUpdated: true,
          providerCardsCreated: true,
          providerCardsUpdated: true,
          snapshotsCreated: true,
          historyCreated: true,
          errorsCount: true,
        },
      }),
      prisma.marketImportJob.findFirst({
        where: {
          marketProviderId: provider.id,
        },
        orderBy: {
          startedAt: "desc",
        },
      }),
      prisma.marketImportJob.findFirst({
        where: {
          marketProviderId: provider.id,
          status: IMPORT_STATUS.SUCCESS,
        },
        orderBy: {
          finishedAt: "desc",
        },
      }),
    ]);

  return {
    providerCode: provider.code,
    totalJobs: jobs,
    successfulJobs: successCount,
    failedJobs: failedCount,
    runningJobs: runningCount,
    totalCardsCreated: aggregate._sum.cardsCreated || 0,
    totalCardsUpdated: aggregate._sum.cardsUpdated || 0,
    totalProviderCardsCreated: aggregate._sum.providerCardsCreated || 0,
    totalProviderCardsUpdated: aggregate._sum.providerCardsUpdated || 0,
    totalRows: aggregate._sum.totalRows || 0,
    totalProcessedRows: aggregate._sum.processedRows || 0,
    totalSkippedRows: aggregate._sum.skippedRows || 0,
    totalSnapshotsCreated: aggregate._sum.snapshotsCreated || 0,
    totalHistoryCreated: aggregate._sum.historyCreated || 0,
    totalErrors: aggregate._sum.errorsCount || 0,
    lastRunAt: latestJob ? latestJob.startedAt : null,
    lastSuccessAt: latestSuccessJob ? latestSuccessJob.finishedAt : null,
    lastImportDurationMs: latestJob ? latestJob.durationMs : null,
    lastImportTotalRows: latestJob ? latestJob.totalRows || 0 : 0,
    lastImportProcessedRows: latestJob ? latestJob.processedRows || 0 : 0,
    lastImportSkippedRows: latestJob ? latestJob.skippedRows || 0 : 0,
    lastImportCardsCreated: latestJob ? latestJob.cardsCreated || 0 : 0,
    lastImportCardsUpdated: latestJob ? latestJob.cardsUpdated || 0 : 0,
    lastImportSnapshotsCreated: latestJob ? latestJob.snapshotsCreated || 0 : 0,
    lastImportErrorsCount: latestJob ? latestJob.errorsCount || 0 : 0,
    lastJob: latestJob,
  };
}

module.exports = {
  createStatistics,
  getSportsCardsProSyncStatistics,
};
