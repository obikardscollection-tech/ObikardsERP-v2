const fsPromises = require("fs/promises");
const { createMarketEngineContext } = require("../common/context");
const { detectCsvFormat } = require("./csvDetector");
const { parseCsv } = require("./csvParser");

async function readCsvEngineStage(context) {
  const nextContext = createMarketEngineContext(context);
  const filePath = nextContext.filePath;
  const startedAt = new Date();

  nextContext.runtime.startedAt = startedAt.toISOString();

  try {
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

    nextContext.metadata = {
      ...nextContext.metadata,
      fileSize: fileStats.size,
      encoding: format.encoding,
      delimiter: format.delimiter,
      headers: format.headers,
    };

    for await (const row of parseCsv(filePath, {
      delimiter: format.delimiter,
      headers: format.headers,
    })) {
      nextContext.data.rawRows.push(row);
      nextContext.stats.readRows += 1;
    }

    nextContext.metadata = {
      ...nextContext.metadata,
      rowsCount: nextContext.stats.readRows,
    };

    return nextContext;
  } finally {
    const finishedAt = new Date();

    nextContext.runtime.finishedAt = finishedAt.toISOString();
    nextContext.runtime.durationMs =
      finishedAt.getTime() - startedAt.getTime();
  }
}

module.exports = {
  readCsvEngineStage,
};