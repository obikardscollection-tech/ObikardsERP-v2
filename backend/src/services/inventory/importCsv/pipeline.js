const {
  readCsvEngineStage,
  validateCsvEngineStage,
  normalizeCsvEngineStage,
  fingerprintCsvEngineStage,
  matchCsvEngineStage,
  referenceCsvEngineStage,
  importCsvEngineStage,
  snapshotCsvEngineStage,
  historyCsvEngineStage,
  analyticsCsvEngineStage,
  importJobCsvEngineStage,
  importErrorCsvEngineStage,
} = require("../../../modules/market/engine/csv");

const SHARED_CSV_ANALYSIS_STAGES = [
  readCsvEngineStage,
  validateCsvEngineStage,
  normalizeCsvEngineStage,
  fingerprintCsvEngineStage,
  matchCsvEngineStage,
];

const IMPORT_CSV_ENRICHMENT_STAGES = [
  referenceCsvEngineStage,
  importCsvEngineStage,
  snapshotCsvEngineStage,
  historyCsvEngineStage,
  analyticsCsvEngineStage,
  importJobCsvEngineStage,
  importErrorCsvEngineStage,
];

/**
 * Execute a sequence of CSV engine stages.
 * @param {object} initialContext
 * @param {Array<(context:object)=>object|Promise<object>>} stages
 * @returns {Promise<object>}
 */
async function runCsvEngineStages(initialContext, stages) {
  let context = initialContext;

  for (const stage of stages) {
    context = await stage(context);
  }

  return context;
}

/**
 * Run the shared read-only CSV analysis pipeline.
 * @param {string} filePath
 * @returns {Promise<object>}
 */
async function runCsvAnalysisPipeline(filePath) {
  return runCsvEngineStages({ filePath }, SHARED_CSV_ANALYSIS_STAGES);
}

/**
 * Run the preview CSV pipeline.
 * @param {string} filePath
 * @returns {Promise<object>}
 */
async function runCsvPreviewPipeline(filePath) {
  return runCsvAnalysisPipeline(filePath);
}

/**
 * Run the import CSV pipeline and return the final context.
 * @param {string} filePath
 * @returns {Promise<object>}
 */
async function runCsvImportPipeline(filePath) {
  const analysisContext = await runCsvAnalysisPipeline(filePath);

  return runCsvEngineStages(analysisContext, IMPORT_CSV_ENRICHMENT_STAGES);
}

module.exports = {
  runCsvPreviewPipeline,
  runCsvImportPipeline,
};
