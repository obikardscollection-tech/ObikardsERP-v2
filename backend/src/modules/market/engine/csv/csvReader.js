const fs = require("fs");
const fsPromises = require("fs/promises");
const { parse } = require("csv-parse");
const { createMarketEngineContext } = require("../common/context");

function parseSingleCsvLine(line, delimiter) {
  return new Promise((resolve, reject) => {
    const parser = parse({
      delimiter,
      relax_quotes: true,
      trim: true,
      bom: true,
    });

    let record = null;

    parser.on("readable", () => {
      let row;

      while ((row = parser.read()) !== null) {
        record = row;
      }
    });

    parser.on("error", reject);
    parser.on("end", () => {
      resolve(Array.isArray(record) ? record : []);
    });

    parser.write(line);
    parser.end();
  });
}

async function detectDelimiterAndHeaders(headerLine) {
  const commaHeaders = await parseSingleCsvLine(headerLine, ",");
  const semicolonHeaders = await parseSingleCsvLine(headerLine, ";");

  if (semicolonHeaders.length > commaHeaders.length) {
    return {
      delimiter: ";",
      headers: semicolonHeaders,
    };
  }

  return {
    delimiter: ",",
    headers: commaHeaders,
  };
}

function extractLine(buffer) {
  const newLineIndex = buffer.indexOf("\n");

  if (newLineIndex === -1) {
    return null;
  }

  const line = buffer.slice(0, newLineIndex).replace(/\r$/, "");
  const rest = buffer.slice(newLineIndex + 1);

  return {
    line,
    rest,
  };
}

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

    const csvStream = fs.createReadStream(filePath, {
      encoding: "utf8",
    });

    let encoding = "utf-8";
    let buffer = "";
    let delimiter = null;
    let headers = [];
    let parser = null;
    let parserConsumer = null;

    nextContext.data.rawRows = [];
    nextContext.stats.readRows = 0;

    for await (const chunk of csvStream) {
      if (!buffer && nextContext.stats.readRows === 0 && chunk.charCodeAt(0) === 0xfeff) {
        encoding = "utf-8-bom";
      }

      buffer += chunk;

      if (!parser) {
        let extracted = extractLine(buffer);

        while (extracted) {
          const candidateLine = extracted.line;
          buffer = extracted.rest;

          if (candidateLine.trim() !== "") {
            const detected = await detectDelimiterAndHeaders(candidateLine);
            delimiter = detected.delimiter;
            headers = detected.headers.map((header) => String(header).trim());

            if (!headers.length || headers.every((header) => !header)) {
              throw new Error("Aucune colonne n'a été trouvée.");
            }

            parser = parse({
              columns: headers,
              delimiter,
              bom: true,
              skip_empty_lines: true,
              relax_quotes: true,
              trim: true,
            });

            parserConsumer = (async () => {
              for await (const row of parser) {
                nextContext.data.rawRows.push(row);
                nextContext.stats.readRows += 1;
              }
            })();

            if (buffer) {
              parser.write(buffer);
              buffer = "";
            }

            break;
          }

          extracted = extractLine(buffer);
        }
      } else {
        parser.write(buffer);
        buffer = "";
      }
    }

    if (!parser) {
      if (!buffer.trim()) {
        throw new Error("Aucune colonne n'a été trouvée.");
      }

      const detected = await detectDelimiterAndHeaders(buffer);
      delimiter = detected.delimiter;
      headers = detected.headers.map((header) => String(header).trim());

      if (!headers.length || headers.every((header) => !header)) {
        throw new Error("Aucune colonne n'a été trouvée.");
      }

      parser = parse({
        columns: headers,
        delimiter,
        bom: true,
        skip_empty_lines: true,
        relax_quotes: true,
        trim: true,
      });

      parserConsumer = (async () => {
        for await (const row of parser) {
          nextContext.data.rawRows.push(row);
          nextContext.stats.readRows += 1;
        }
      })();

      parser.end();
      await parserConsumer;
    } else {
      if (buffer) {
        parser.write(buffer);
        buffer = "";
      }

      parser.end();
      await parserConsumer;
    }

    nextContext.metadata = {
      ...nextContext.metadata,
      fileSize: fileStats.size,
      encoding,
      delimiter,
      headers,
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