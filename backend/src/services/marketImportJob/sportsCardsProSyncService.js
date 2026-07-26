const path = require("path");

const prisma = require("../../lib/prisma");
const {
  createSportsCardsProImport,
} = require("../../modules/market/sportscardspro/sportsCardsProOrchestrator");
const {
  runCsvImportPipeline,
} = require("../inventory/importCsv/pipeline");
const {
  SPORTS_CARDS_PRO_PROVIDER,
  ERROR_CODES,
} = require("./sportsCardsProConstants");
const {
  resolveFilePath,
  normalizeImportSource,
} = require("./sportsCardsProConfigurationService");
const {
  acquireImportLock,
  releaseImportLockSuccess,
  releaseImportLockFailure,
} = require("./sportsCardsProImportLockService");
const { synchronizeOneRow } = require("./sportsCardsProSyncRowService");
const {
  createStatistics,
  getSportsCardsProSyncStatistics,
} = require("./sportsCardsProStatisticsService");
const { SyncError } = require("./sportsCardsProHelpers");

async function ensureSportsCardsProProvider() {
  const existing = await prisma.marketProvider.findUnique({
    where: {
      code: SPORTS_CARDS_PRO_PROVIDER.CODE,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.marketProvider.create({
    data: {
      code: SPORTS_CARDS_PRO_PROVIDER.CODE,
      name: SPORTS_CARDS_PRO_PROVIDER.NAME,
      type: "BOTH",
      supportsCsv: true,
      supportsApi: true,
      enabled: true,
      priority: 0,
    },
  });
}

async function persistRowErrors(jobId, errorEntries) {
  if (errorEntries.length === 0) {
    return;
  }

  await prisma.marketImportError.createMany({
    data: errorEntries.map((entry) => ({
      marketImportJobId: jobId,
      lineNumber: entry.lineNumber,
      providerCardId: entry.providerCardId,
      field: entry.field,
      errorCode: entry.errorCode,
      message: entry.message,
      rawData: entry.rawData,
    })),
  });
}

async function executeSportsCardsProSync(input = {}) {
  const source = normalizeImportSource(input.source);
  const filePath = resolveFilePath(input.filePath);
  const provider = await ensureSportsCardsProProvider();

  const syncContext = createSportsCardsProImport({
    type: "csv",
    filePath,
  });
  const startedAt = new Date();
  let job = null;

  job = await acquireImportLock({
    providerId: provider.id,
    source,
    fileName: path.basename(filePath),
    startedAt,
  });

  const stats = createStatistics();
  const synchronizedAt = new Date();
  const errorEntries = [];

  try {
    const pipelineContext = await runCsvImportPipeline(syncContext.filePath);
    const normalizedRows =
      pipelineContext &&
      pipelineContext.data &&
      Array.isArray(pipelineContext.data.normalizedRows)
        ? pipelineContext.data.normalizedRows
        : [];

    stats.totalRows = normalizedRows.length;

    for (let index = 0; index < normalizedRows.length; index += 1) {
      const row = normalizedRows[index];

      try {
        await synchronizeOneRow(
          provider.id,
          row,
          stats,
          synchronizedAt
        );
      } catch (error) {
        stats.errorsCount += 1;
        stats.skippedRows += 1;

        errorEntries.push({
          lineNumber: index + 1,
          providerCardId: null,
          field: null,
          errorCode:
            error && error.code
              ? error.code
              : ERROR_CODES.INVALID_ROW,
          message:
            error instanceof Error
              ? error.message
              : "Erreur inconnue pendant la synchronisation.",
          rawData: row,
        });
      }
    }

    await persistRowErrors(job.id, errorEntries);

    const finishedAt = new Date();

    const updatedJob = await releaseImportLockSuccess({
      jobId: job.id,
      startedAt,
      finishedAt,
      stats,
    });

    await prisma.marketProvider.update({
      where: {
        id: provider.id,
      },
      data: {
        lastCsvSync: finishedAt,
      },
    });

    return {
      message: "Synchronisation SportsCardsPro terminee.",
      job: updatedJob,
      statistics: stats,
    };
  } catch (error) {
    const finishedAt = new Date();

    if (job && job.id) {
      await releaseImportLockFailure({
        jobId: job.id,
        startedAt,
        finishedAt,
        stats,
        errorsCount: stats.errorsCount + 1,
      });

      await prisma.marketImportError.create({
        data: {
          marketImportJobId: job.id,
          errorCode:
            error && error.code
              ? error.code
              : ERROR_CODES.JOB_FAILURE,
          message:
            error instanceof Error
              ? error.message
              : "Echec de synchronisation SportsCardsPro.",
        },
      });
    }

    throw error;
  }
}

module.exports = {
  SyncError,
  executeSportsCardsProSync,
  getSportsCardsProSyncStatistics,
};
