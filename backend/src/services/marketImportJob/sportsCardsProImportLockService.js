const prisma = require("../../lib/prisma");
const {
  IMPORT_STATUS,
  ERROR_CODES,
} = require("./sportsCardsProConstants");
const { resolveStaleMinutes } = require("./sportsCardsProConfigurationService");
const { SyncError } = require("./sportsCardsProHelpers");

async function recoverStaleRunningImports(providerId) {
  const staleMinutes = resolveStaleMinutes();
  const threshold = new Date(Date.now() - staleMinutes * 60 * 1000);

  return prisma.marketImportJob.updateMany({
    where: {
      marketProviderId: providerId,
      status: IMPORT_STATUS.RUNNING,
      startedAt: {
        lt: threshold,
      },
    },
    data: {
      status: IMPORT_STATUS.FAILED,
      finishedAt: new Date(),
    },
  });
}

async function getRunningImport(providerId) {
  return prisma.marketImportJob.findFirst({
    where: {
      marketProviderId: providerId,
      status: IMPORT_STATUS.RUNNING,
    },
    orderBy: {
      startedAt: "desc",
    },
  });
}

async function getCurrentLockOwner(providerId) {
  return prisma.marketImportJob.findFirst({
    where: {
      marketProviderId: providerId,
      status: IMPORT_STATUS.RUNNING,
    },
    orderBy: [
      {
        startedAt: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });
}

async function assertNoRunningImport(providerId) {
  const runningJob = await getRunningImport(providerId);

  if (runningJob) {
    throw new SyncError(
      "Une synchronisation SportsCardsPro est deja en cours.",
      ERROR_CODES.IMPORT_ALREADY_RUNNING,
      {
        runningJobId: runningJob.id,
      }
    );
  }
}

async function acquireImportLock({ providerId, source, fileName, startedAt }) {
  await recoverStaleRunningImports(providerId);
  await assertNoRunningImport(providerId);

  const createdJob = await prisma.marketImportJob.create({
    data: {
      marketProviderId: providerId,
      status: IMPORT_STATUS.RUNNING,
      source,
      fileName,
      startedAt,
    },
  });

  // Guard against near-simultaneous starts that can pass the pre-check together.
  const lockOwner = await getCurrentLockOwner(providerId);

  if (lockOwner && lockOwner.id !== createdJob.id) {
    const now = new Date();

    await prisma.marketImportJob.update({
      where: {
        id: createdJob.id,
      },
      data: {
        status: IMPORT_STATUS.FAILED,
        finishedAt: now,
        durationMs: now.getTime() - new Date(startedAt).getTime(),
        errorsCount: 1,
      },
    });

    throw new SyncError(
      "Une synchronisation SportsCardsPro est deja en cours.",
      ERROR_CODES.IMPORT_ALREADY_RUNNING,
      {
        runningJobId: lockOwner.id,
      }
    );
  }

  return createdJob;
}

async function releaseImportLockSuccess({
  jobId,
  startedAt,
  finishedAt,
  stats,
}) {
  return prisma.marketImportJob.update({
    where: {
      id: jobId,
    },
    data: {
      status: IMPORT_STATUS.SUCCESS,
      finishedAt,
      durationMs: finishedAt.getTime() - new Date(startedAt).getTime(),
      totalRows: stats.totalRows,
      processedRows: stats.processedRows,
      skippedRows: stats.skippedRows,
      cardsCreated: stats.cardsCreated,
      cardsUpdated: stats.cardsUpdated,
      providerCardsCreated: stats.providerCardsCreated,
      providerCardsUpdated: stats.providerCardsUpdated,
      snapshotsCreated: stats.snapshotsCreated + stats.snapshotsUpdated,
      historyCreated: stats.historyCreated,
      referencesUpdated: stats.referencesUpdated,
      analyticsUpdated: stats.analyticsUpdated,
      errorsCount: stats.errorsCount,
      warningsCount: stats.warningsCount,
    },
  });
}

async function releaseImportLockFailure({
  jobId,
  startedAt,
  finishedAt,
  stats,
  errorsCount,
}) {
  return prisma.marketImportJob.update({
    where: {
      id: jobId,
    },
    data: {
      status: IMPORT_STATUS.FAILED,
      finishedAt,
      durationMs: finishedAt.getTime() - new Date(startedAt).getTime(),
      totalRows: stats && Number.isFinite(stats.totalRows) ? stats.totalRows : 0,
      processedRows:
        stats && Number.isFinite(stats.processedRows) ? stats.processedRows : 0,
      skippedRows: stats && Number.isFinite(stats.skippedRows) ? stats.skippedRows : 0,
      errorsCount,
    },
  });
}

module.exports = {
  recoverStaleRunningImports,
  getRunningImport,
  assertNoRunningImport,
  acquireImportLock,
  releaseImportLockSuccess,
  releaseImportLockFailure,
};
