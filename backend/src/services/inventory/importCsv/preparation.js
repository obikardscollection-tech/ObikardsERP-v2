const fsPromises = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const { INTERNALS } = require("./constants");
const {
  assertUploadedCsvFile,
  validateMatchedRows,
} = require("./validation");

/**
 * Safely remove a temporary CSV file.
 * @param {string|null} tempFilePath
 * @returns {Promise<void>}
 */
async function cleanupTempFile(tempFilePath) {
  if (typeof tempFilePath === "string") {
    await fsPromises.unlink(tempFilePath).catch(() => {});
  }
}

/**
 * Materialize the uploaded CSV into a temporary file.
 * @param {Buffer} buffer
 * @param {string} originalName
 * @returns {Promise<string>}
 */
async function writeTempCsvFile(buffer, originalName) {
  const tempFileName = `${INTERNALS.TEMP_PREFIX}${crypto.randomUUID()}${path.extname(originalName || ".csv") || ".csv"}`;
  const tempFilePath = path.join(os.tmpdir(), tempFileName);

  await fsPromises.writeFile(tempFilePath, buffer);

  return tempFilePath;
}

/**
 * Execute the shared CSV preparation flow and auto-clean temp file.
 * @param {{buffer:Buffer, originalname?:string, mimetype?:string}} file
 * @param {(payload:{context:object,matchedRows:object[]})=>Promise<void>|void} worker
 * @param {(filePath:string)=>Promise<object>} pipeline
 */
async function withPreparedCsvRows(file, worker, pipeline) {
  assertUploadedCsvFile(file);

  let tempFilePath = null;

  try {
    tempFilePath = await writeTempCsvFile(file.buffer, file.originalname);

    const context = await pipeline(tempFilePath);
    const matchedRows = validateMatchedRows(
      context?.data?.[INTERNALS.DATA_KEYS.MATCHED_ROWS]
    );

    await worker({ context, matchedRows });
  } finally {
    await cleanupTempFile(tempFilePath);
  }
}

module.exports = {
  withPreparedCsvRows,
};
