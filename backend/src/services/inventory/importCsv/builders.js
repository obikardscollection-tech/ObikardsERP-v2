const { INTERNALS } = require("./constants");

/**
 * Create a fresh import report structure.
 * @returns {{success:boolean,totalRows:number,created:number,updated:number,failed:number,skipped:number,duplicates:number,warnings:Array<unknown>,errors:Array<{row:number,message:string}>,rows:Array<{row:number,status:string,identifier:string|null,changes:string[],warnings:string[],errors:string[],matching:object|null}>,durationMs:number,matching:{single:number,multiple:number,none:number,unknown:number},conflicts:Array<{row:number,message:string}>,invalidRows:number}}
 */
function createImportReport() {
  return {
    success: INTERNALS.REPORT.SUCCESS,
    totalRows: INTERNALS.REPORT.TOTAL_ROWS,
    created: INTERNALS.REPORT.CREATED,
    updated: INTERNALS.REPORT.UPDATED,
    failed: INTERNALS.REPORT.FAILED,
    skipped: INTERNALS.REPORT.SKIPPED,
    duplicates: INTERNALS.REPORT.DUPLICATES,
    warnings: [...INTERNALS.REPORT.WARNINGS],
    errors: [],
    rows: [],
    durationMs: 0,
    matching: {
      single: 0,
      multiple: 0,
      none: 0,
      unknown: 0,
    },
    conflicts: [],
    invalidRows: 0,
  };
}

/**
 * Create a fresh CSV preview report structure.
 * @returns {{provider:string|null,providerVersion:string|null,confidence:number,score:number,maxScore:number,totalRows:number,validRows:number,invalidRows:number,recognizedColumns:string[],ignoredColumns:string[],matchedHeaders:string[],warnings:string[],errors:Array<{row:number,message:string}>,previewRows:object[],durationMs:number,statusCounters:{ready:number,skip:number,duplicate:number,invalid:number},matching:{single:number,multiple:number,none:number,unknown:number},conflicts:Array<{row:number,message:string}>,missingCriticalColumns:string[]}}
 */
function createPreviewReport() {
  return {
    provider: null,
    providerVersion: null,
    confidence: 0,
    score: 0,
    maxScore: 0,
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    recognizedColumns: [],
    ignoredColumns: [],
    matchedHeaders: [],
    warnings: [],
    errors: [],
    previewRows: [],
    durationMs: 0,
    statusCounters: {
      ready: 0,
      skip: 0,
      duplicate: 0,
      invalid: 0,
    },
    matching: {
      single: 0,
      multiple: 0,
      none: 0,
      unknown: 0,
    },
    conflicts: [],
    missingCriticalColumns: [],
  };
}

/**
 * Build a row-scoped error payload.
 * @param {number} rowIndex
 * @param {string} message
 * @returns {{row:number,message:string}}
 */
function createRowError(rowIndex, message) {
  return {
    row: rowIndex + 1,
    message,
  };
}

/**
 * Build a readable row identifier from inventory DTO fields.
 * @param {object|null|undefined} dto
 * @returns {string|null}
 */
function createRowIdentifier(dto) {
  if (!dto || typeof dto !== "object" || Array.isArray(dto)) {
    return null;
  }

  const year = dto.year !== undefined && dto.year !== null ? String(dto.year).trim() : "";
  const series = typeof dto.series === "string" ? dto.series.trim() : "";
  const cardNumber = typeof dto.cardNumber === "string" ? dto.cardNumber.trim() : "";
  const player = typeof dto.player === "string" ? dto.player.trim() : "";
  const parallel = typeof dto.parallel === "string" ? dto.parallel.trim() : "";
  const variation = typeof dto.variation === "string" ? dto.variation.trim() : "";
  const grade = typeof dto.grade === "string" ? dto.grade.trim() : "";

  const baseParts = [];

  if (year) {
    baseParts.push(year);
  }

  if (series) {
    baseParts.push(series);
  }

  let baseIdentifier = baseParts.join(" ");

  if (cardNumber) {
    baseIdentifier = baseIdentifier ? `${baseIdentifier} #${cardNumber}` : `#${cardNumber}`;
  }

  const suffixParts = [];

  if (parallel) {
    suffixParts.push(parallel);
  }

  if (variation) {
    suffixParts.push(variation);
  }

  if (grade) {
    suffixParts.push(grade);
  }

  if (suffixParts.length > 0) {
    baseIdentifier = baseIdentifier
      ? `${baseIdentifier} ${suffixParts.join(" ")}`
      : suffixParts.join(" ");
  }

  if (player) {
    return baseIdentifier ? `${player} - ${baseIdentifier}` : player;
  }

  return baseIdentifier || null;
}

module.exports = {
  createImportReport,
  createPreviewReport,
  createRowError,
  createRowIdentifier,
};
