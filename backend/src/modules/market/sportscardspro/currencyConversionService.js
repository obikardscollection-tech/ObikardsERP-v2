const INTERNALS = {
  CURRENCIES: {
    USD: "USD",
    EUR: "EUR",
  },
  DECIMAL: {
    // Limits floating-point artifacts while preserving practical monetary precision.
    MAX_DECIMAL_PRECISION: 12,
  },
};

/**
 * Official reusable model for currency conversion across ERP services.
 * @typedef {Object} CurrencyConversionResultModel
 * @property {string|null} sourceCurrency
 * @property {string|null} targetCurrency
 * @property {number|null} exchangeRate
 * @property {number|null} originalAmount
 * @property {number|null} convertedAmount
 */

/**
 * @typedef {Object} CurrencyConversionInput
 * @property {unknown} amount
 * @property {unknown} sourceCurrency
 * @property {unknown} targetCurrency
 * @property {unknown} exchangeRate
 */

/**
 * Check whether a value is missing for conversion purposes.
 * @param {unknown} value
 * @returns {boolean}
 */
function isMissingValue(value) {
  return value === null || value === undefined || value === "";
}

/**
 * Normalize currency code.
 * @param {unknown} currency
 * @returns {string|null}
 */
function normalizeCurrency(currency) {
  if (typeof currency !== "string") {
    return null;
  }

  const normalized = currency.trim().toUpperCase();

  return normalized === "" ? null : normalized;
}

/**
 * Count decimal places for a finite number.
 * @param {number} value
 * @returns {number}
 */
function getDecimalPlaces(value) {
  const asString = value.toString();

  if (asString.includes("e-") || asString.includes("E-")) {
    const [base, exponent] = asString.toLowerCase().split("e-");
    const baseDecimals = (base.split(".")[1] || "").length;

    return baseDecimals + Number(exponent);
  }

  if (!asString.includes(".")) {
    return 0;
  }

  return asString.split(".")[1].length;
}

/**
 * Normalize numeric inputs from number or numeric string.
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
 * Multiply two numbers while preserving decimal precision.
 * @param {number} amount
 * @param {number} exchangeRate
 * @returns {number}
 */
function multiplyWithPrecision(amount, exchangeRate) {
  const precision = Math.min(
    INTERNALS.DECIMAL.MAX_DECIMAL_PRECISION,
    getDecimalPlaces(amount) + getDecimalPlaces(exchangeRate)
  );

  return Number((amount * exchangeRate).toFixed(precision));
}

/**
 * Normalize conversion input payload.
 * @param {unknown} input
 * @returns {{amount:number|null, sourceCurrency:string|null, targetCurrency:string|null, exchangeRate:number|null}}
 */
function normalizeConversionInput(input) {
  const payload = input && typeof input === "object" && !Array.isArray(input) ? input : {};

  return {
    amount: normalizeAmount(payload.amount),
    sourceCurrency: normalizeCurrency(payload.sourceCurrency),
    targetCurrency: normalizeCurrency(payload.targetCurrency),
    exchangeRate: normalizeAmount(payload.exchangeRate),
  };
}

/**
 * Build normalized currency conversion payload.
 * @param {string|null} sourceCurrency
 * @param {string|null} targetCurrency
 * @param {number|null} originalAmount
 * @param {number|null} exchangeRate
 * @param {number|null} convertedAmount
 * @returns {CurrencyConversionResultModel}
 */
function createConversionPayload(sourceCurrency, targetCurrency, originalAmount, exchangeRate, convertedAmount) {
  return {
    sourceCurrency,
    targetCurrency,
    exchangeRate,
    originalAmount,
    convertedAmount,
  };
}

/**
 * Convert one currency amount using a caller-provided exchange rate.
 * @param {CurrencyConversionInput} input
 * @returns {CurrencyConversionResultModel}
 */
function convertCurrency(input) {
  const normalized = normalizeConversionInput(input);

  if (normalized.amount === null || normalized.exchangeRate === null) {
    return createConversionPayload(
      normalized.sourceCurrency,
      normalized.targetCurrency,
      normalized.amount,
      normalized.exchangeRate,
      null
    );
  }

  const convertedAmount = multiplyWithPrecision(normalized.amount, normalized.exchangeRate);

  return createConversionPayload(
    normalized.sourceCurrency,
    normalized.targetCurrency,
    normalized.amount,
    normalized.exchangeRate,
    convertedAmount
  );
}

/**
 * Convert a USD amount to EUR using a caller-provided exchange rate.
 * @param {unknown} usdAmount
 * @param {unknown} exchangeRate
 * @returns {CurrencyConversionResultModel}
 */
function convertUsdToEur(usdAmount, exchangeRate) {
  const resolvedExchangeRate = exchangeRate === null || exchangeRate === undefined || exchangeRate === "" ? 0.92 : exchangeRate;

  return convertCurrency({
    amount: usdAmount,
    sourceCurrency: INTERNALS.CURRENCIES.USD,
    targetCurrency: INTERNALS.CURRENCIES.EUR,
    exchangeRate: resolvedExchangeRate,
  });
}

module.exports = {
  convertCurrency,
  convertUsdToEur,
};
