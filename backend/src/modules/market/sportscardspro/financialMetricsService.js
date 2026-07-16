const INTERNALS = {
  DECIMAL: {
    MAX_DECIMAL_PRECISION: 12,
  },
  PERCENT: {
    MULTIPLIER: 100,
  },
  DEFAULTS: {
    FEES: 0,
  },
};

/**
 * @typedef {Object} FinancialMetricsInput
 * @property {unknown} purchasePrice
 * @property {unknown} marketValue
 * @property {unknown} fees
 */

/**
 * Official reusable financial model for ERP services.
 * @typedef {Object} FinancialMetricsResultModel
 * @property {number|null} purchasePrice
 * @property {number|null} marketValue
 * @property {number|null} fees
 * @property {number|null} profit
 * @property {number|null} margin
 * @property {number|null} roi
 */

/**
 * Check whether a value is missing.
 * @param {unknown} value
 * @returns {boolean}
 */
function isMissingValue(value) {
  return value === null || value === undefined || value === "";
}

/**
 * Normalize one numeric amount from number or numeric string.
 * @param {unknown} value
 * @returns {number|null}
 */
function normalizeAmount(value) {
  if (isMissingValue(value)) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed === "") {
      return null;
    }

    const normalized = trimmed.replace(",", ".");
    const numeric = Number(normalized);

    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
}

/**
 * Normalize fees amount. Missing fees are treated as zero.
 * @param {unknown} fees
 * @returns {number|null}
 */
function normalizeFees(fees) {
  if (isMissingValue(fees)) {
    return INTERNALS.DEFAULTS.FEES;
  }

  return normalizeAmount(fees);
}

/**
 * Normalize decimal precision for stable outputs.
 * @param {number} value
 * @returns {number}
 */
function normalizeDecimal(value) {
  return Number(value.toFixed(INTERNALS.DECIMAL.MAX_DECIMAL_PRECISION));
}

/**
 * Normalize raw input payload into safe numeric values.
 * @param {unknown} input
 * @returns {{purchasePrice:number|null, marketValue:number|null, fees:number|null}}
 */
function normalizeInput(input) {
  const payload = input && typeof input === "object" && !Array.isArray(input) ? input : {};

  return {
    purchasePrice: normalizeAmount(payload.purchasePrice),
    marketValue: normalizeAmount(payload.marketValue),
    fees: normalizeFees(payload.fees),
  };
}

/**
 * Calculate profit: marketValue - purchasePrice - fees.
 * @param {number|null} purchasePrice
 * @param {number|null} marketValue
 * @param {number|null} fees
 * @returns {number|null}
 */
function calculateProfit(purchasePrice, marketValue, fees) {
  if (purchasePrice === null || marketValue === null || fees === null) {
    return null;
  }

  return normalizeDecimal(marketValue - purchasePrice - fees);
}

/**
 * Calculate margin percentage: (profit / marketValue) * 100.
 * @param {number|null} profit
 * @param {number|null} marketValue
 * @returns {number|null}
 */
function calculateMargin(profit, marketValue) {
  if (profit === null || marketValue === null || marketValue === 0) {
    return null;
  }

  return normalizeDecimal((profit / marketValue) * INTERNALS.PERCENT.MULTIPLIER);
}

/**
 * Calculate ROI percentage: (profit / purchasePrice) * 100.
 * @param {number|null} profit
 * @param {number|null} purchasePrice
 * @returns {number|null}
 */
function calculateRoi(profit, purchasePrice) {
  if (profit === null || purchasePrice === null || purchasePrice === 0) {
    return null;
  }

  return normalizeDecimal((profit / purchasePrice) * INTERNALS.PERCENT.MULTIPLIER);
}

/**
 * Build normalized financial metrics payload.
 * @param {number|null} purchasePrice
 * @param {number|null} marketValue
 * @param {number|null} fees
 * @param {number|null} profit
 * @param {number|null} margin
 * @param {number|null} roi
 * @returns {FinancialMetricsResultModel}
 */
function createFinancialMetricsPayload(purchasePrice, marketValue, fees, profit, margin, roi) {
  return {
    purchasePrice,
    marketValue,
    fees,
    profit,
    margin,
    roi,
  };
}

/**
 * Calculate financial metrics for one card.
 * This component is provider-agnostic and only manipulates numbers.
 * @param {FinancialMetricsInput} input
 * @returns {FinancialMetricsResultModel}
 */
function calculateFinancialMetrics(input) {
  const normalized = normalizeInput(input);
  const profit = calculateProfit(normalized.purchasePrice, normalized.marketValue, normalized.fees);
  const margin = calculateMargin(profit, normalized.marketValue);
  const roi = calculateRoi(profit, normalized.purchasePrice);

  return createFinancialMetricsPayload(
    normalized.purchasePrice,
    normalized.marketValue,
    normalized.fees,
    profit,
    margin,
    roi
  );
}

module.exports = {
  calculateFinancialMetrics,
};
