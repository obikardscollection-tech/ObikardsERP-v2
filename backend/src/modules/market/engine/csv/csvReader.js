const fsPromises = require("fs/promises");
const { createMarketEngineContext } = require("../common/context");
const { detectCsvFormat } = require("./csvDetector");
const { parseCsv } = require("./csvParser");

const INTERNALS = {
  KEYS: {
    FILE_PATH: "filePath",
    METADATA: "metadata",
    RUNTIME: "runtime",
    STATS: "stats",
    DATA: "data",
    RAW_ROWS: "rawRows",
    STARTED_AT: "startedAt",
    FINISHED_AT: "finishedAt",
    DURATION_MS: "durationMs",
    READ_ROWS: "readRows",
    FILE_SIZE: "fileSize",
    ENCODING: "encoding",
    DELIMITER: "delimiter",
    HEADERS: "headers",
    ROWS_COUNT: "rowsCount",
  },
};

/**
 * Build a new immutable context enriched with raw CSV rows and file metadata.
 * @param {object} context
 * @returns {Promise<object>}
 */

async function readCsvEngineStage(context) {
  const baseContext = createMarketEngineContext(context);
  const filePath = baseContext[INTERNALS.KEYS.FILE_PATH];
  const startedAt = new Date();

  if (!filePath) {
    throw new Error("Le fichier CSV est introuvable.");
  }

  try {
    await fsPromises.access(filePath);
  } catch {
    throw new Error("Le fichier CSV est introuvable.");
  }

  const fileStats = await fsPromises.stat(filePath);

  if (!fileStats.size) {
    throw new Error("Le fichier CSV est vide.");
  }

  const format = await detectCsvFormat(filePath);
  const rawRows = [];

  for await (const row of parseCsv(filePath, {
    delimiter: format.delimiter,
    headers: format.headers,
  })) {
    rawRows.push(row);
  }

  const finishedAt = new Date();
  const readRows = rawRows.length;

  const nextMetadata = {
    ...baseContext[INTERNALS.KEYS.METADATA],
    [INTERNALS.KEYS.FILE_SIZE]: fileStats.size,
    [INTERNALS.KEYS.ENCODING]: format.encoding,
    [INTERNALS.KEYS.DELIMITER]: format.delimiter,
    [INTERNALS.KEYS.HEADERS]: format.headers,
    [INTERNALS.KEYS.ROWS_COUNT]: readRows,
  };

  const nextRuntime = {
    ...baseContext[INTERNALS.KEYS.RUNTIME],
    [INTERNALS.KEYS.STARTED_AT]: startedAt.toISOString(),
    [INTERNALS.KEYS.FINISHED_AT]: finishedAt.toISOString(),
    [INTERNALS.KEYS.DURATION_MS]: finishedAt.getTime() - startedAt.getTime(),
  };

  const nextStats = {
    ...baseContext[INTERNALS.KEYS.STATS],
    [INTERNALS.KEYS.READ_ROWS]: readRows,
  };

  const nextData = {
    ...baseContext[INTERNALS.KEYS.DATA],
    [INTERNALS.KEYS.RAW_ROWS]: rawRows,
  };

  return {
    ...baseContext,
    [INTERNALS.KEYS.METADATA]: nextMetadata,
    [INTERNALS.KEYS.RUNTIME]: nextRuntime,
    [INTERNALS.KEYS.STATS]: nextStats,
    [INTERNALS.KEYS.DATA]: nextData,
  };
}

module.exports = {
  readCsvEngineStage,
};