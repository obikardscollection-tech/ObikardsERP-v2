function SyncError(message, code, details = {}) {
  this.name = "SyncError";
  this.message = message;
  this.code = code;
  this.details = details;
  Error.captureStackTrace?.(this, SyncError);
}

SyncError.prototype = Object.create(Error.prototype);
SyncError.prototype.constructor = SyncError;

function normalizeKey(key) {
  return String(key)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function indexRow(row) {
  const indexed = new Map();

  for (const [key, value] of Object.entries(row)) {
    indexed.set(normalizeKey(key), value);
  }

  return indexed;
}

function readAliasedValue(indexedRow, aliases) {
  for (const alias of aliases) {
    const normalizedAlias = normalizeKey(alias);

    if (!indexedRow.has(normalizedAlias)) {
      continue;
    }

    const value = indexedRow.get(normalizedAlias);

    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === "string") {
      const normalized = value.trim();

      if (normalized !== "") {
        return normalized;
      }

      continue;
    }

    return value;
  }

  return null;
}

function toNullableString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim();

  return normalized === "" ? null : normalized;
}

function toNullableInteger(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  const asString = String(value).trim();

  if (asString === "") {
    return null;
  }

  const direct = Number.parseInt(asString, 10);

  if (!Number.isNaN(direct)) {
    return direct;
  }

  const yearMatch = asString.match(/^(\d{4})/);

  if (yearMatch) {
    return Number.parseInt(yearMatch[1], 10);
  }

  return null;
}

function toNullableDecimal(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const normalized = String(value).replace(/,/g, ".").trim();

  if (normalized === "") {
    return null;
  }

  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function toNullableDate(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function toBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    return ["1", "true", "yes", "y", "oui"].includes(normalized);
  }

  return false;
}

function compactSearchParts(parts) {
  const result = [];

  for (const part of parts) {
    const normalized = toNullableString(part);

    if (normalized) {
      result.push(normalized);
    }
  }

  return result;
}

function buildSlug(parts) {
  return compactSearchParts(parts)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function buildFingerprint(parts) {
  return compactSearchParts(parts)
    .join("|")
    .toLowerCase();
}

function valuesDiffer(left, right) {
  if (left instanceof Date || right instanceof Date) {
    const leftTime = left instanceof Date ? left.getTime() : left ? new Date(left).getTime() : null;
    const rightTime = right instanceof Date ? right.getTime() : right ? new Date(right).getTime() : null;

    return leftTime !== rightTime;
  }

  if (left === null || left === undefined) {
    return !(right === null || right === undefined);
  }

  if (right === null || right === undefined) {
    return !(left === null || left === undefined);
  }

  if (typeof left === "object" || typeof right === "object") {
    return JSON.stringify(left) !== JSON.stringify(right);
  }

  return String(left) !== String(right);
}

function buildChangedFields(currentEntity, nextEntity, allowedFields) {
  const changedFields = {};

  for (const field of allowedFields) {
    if (valuesDiffer(currentEntity[field], nextEntity[field])) {
      changedFields[field] = nextEntity[field];
    }
  }

  return changedFields;
}

module.exports = {
  SyncError,
  normalizeKey,
  indexRow,
  readAliasedValue,
  toNullableString,
  toNullableInteger,
  toNullableDecimal,
  toNullableDate,
  toBoolean,
  compactSearchParts,
  buildSlug,
  buildFingerprint,
  valuesDiffer,
  buildChangedFields,
};
