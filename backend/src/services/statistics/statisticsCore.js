const SUPPORTED_PERIODS = [
  "today",
  "yesterday",
  "week",
  "previous-week",
  "month",
  "previous-month",
  "year",
  "previous-year",
  "custom",
];

const SUPPORTED_GRANULARITY = ["day", "week", "month"];

const SUPPORTED_DIMENSIONS = [
  "sport",
  "player",
  "team",
  "supplier",
  "brand",
  "year",
  "series",
  "set",
  "platform",
  "grading",
  "state",
  "category",
];

const SUPPORTED_TOP_CATEGORIES = [
  "players",
  "cards",
  "brands",
  "suppliers",
  "sports",
  "series",
  "years",
  "platforms",
  "top-roi",
  "top-benefits",
  "top-margins",
  "top-sales",
  "most-expensive-cards",
  "least-profitable-cards",
  "most-profitable-cards",
  "never-sold-cards",
  "oldest-cards",
];

function toNumber(value) {
  const num = Number(value);

  return Number.isFinite(num) ? num : 0;
}

function ratio(value, base) {
  const denominator = toNumber(base);

  if (!denominator) {
    return 0;
  }

  return (toNumber(value) / denominator) * 100;
}

function growthRate(current, previous) {
  const currentValue = toNumber(current);
  const previousValue = toNumber(previous);

  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
}

function startOfDay(date) {
  const output = new Date(date);
  output.setHours(0, 0, 0, 0);
  return output;
}

function endOfDay(date) {
  const output = new Date(date);
  output.setHours(23, 59, 59, 999);
  return output;
}

function startOfWeek(date) {
  const output = startOfDay(date);
  const day = output.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  output.setDate(output.getDate() + diff);
  return output;
}

function endOfWeek(date) {
  const output = startOfWeek(date);
  output.setDate(output.getDate() + 6);
  return endOfDay(output);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

function endOfYear(date) {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function buildNamedRange(period, now = new Date()) {
  if (period === "today") {
    return {
      period,
      from: startOfDay(now),
      to: endOfDay(now),
    };
  }

  if (period === "yesterday") {
    const previousDay = new Date(now);
    previousDay.setDate(previousDay.getDate() - 1);

    return {
      period,
      from: startOfDay(previousDay),
      to: endOfDay(previousDay),
    };
  }

  if (period === "week") {
    return {
      period,
      from: startOfWeek(now),
      to: endOfWeek(now),
    };
  }

  if (period === "previous-week") {
    const previousWeekAnchor = new Date(now);
    previousWeekAnchor.setDate(previousWeekAnchor.getDate() - 7);

    return {
      period,
      from: startOfWeek(previousWeekAnchor),
      to: endOfWeek(previousWeekAnchor),
    };
  }

  if (period === "month") {
    return {
      period,
      from: startOfMonth(now),
      to: endOfMonth(now),
    };
  }

  if (period === "previous-month") {
    const previousMonthAnchor = new Date(now.getFullYear(), now.getMonth() - 1, 15);

    return {
      period,
      from: startOfMonth(previousMonthAnchor),
      to: endOfMonth(previousMonthAnchor),
    };
  }

  if (period === "year") {
    return {
      period,
      from: startOfYear(now),
      to: endOfYear(now),
    };
  }

  const previousYearAnchor = new Date(now.getFullYear() - 1, 6, 1);
  return {
    period,
    from: startOfYear(previousYearAnchor),
    to: endOfYear(previousYearAnchor),
  };
}

function getDateRange(filters = {}) {
  const period = filters.period || "month";

  if (!SUPPORTED_PERIODS.includes(period)) {
    const error = new Error(`Periode non supportee: ${period}`);
    error.statusCode = 400;
    throw error;
  }

  if (period === "custom") {
    const from = parseDate(filters.from);
    const to = parseDate(filters.to);

    if (!from || !to) {
      const error = new Error("Les dates from et to sont obligatoires pour une periode custom.");
      error.statusCode = 400;
      throw error;
    }

    if (from > to) {
      const error = new Error("La date from doit etre inferieure ou egale a to.");
      error.statusCode = 400;
      throw error;
    }

    return {
      period,
      from: startOfDay(from),
      to: endOfDay(to),
    };
  }

  return buildNamedRange(period);
}

function getPreviousRange(range) {
  const durationMs = range.to.getTime() - range.from.getTime();
  const previousTo = new Date(range.from.getTime() - 1);
  const previousFrom = new Date(previousTo.getTime() - durationMs);

  return {
    from: previousFrom,
    to: previousTo,
  };
}

function resolveGranularity(range, requestedGranularity) {
  if (requestedGranularity && SUPPORTED_GRANULARITY.includes(requestedGranularity)) {
    return requestedGranularity;
  }

  const daySpan = Math.ceil((range.to.getTime() - range.from.getTime()) / 86400000);

  if (daySpan > 180) {
    return "month";
  }

  if (daySpan > 45) {
    return "week";
  }

  return "day";
}

function normalizeKey(value) {
  if (value === null || value === undefined || value === "") {
    return "UNSPECIFIED";
  }

  return String(value);
}

function formatRange(range) {
  return {
    period: range.period,
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  };
}

function buildTimeKey(date, granularity) {
  const current = new Date(date);

  if (granularity === "month") {
    return `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, "0")}`;
  }

  if (granularity === "week") {
    const target = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate()));
    const dayNum = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);

    return `${target.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
  }

  return `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, "0")}-${String(current.getUTCDate()).padStart(2, "0")}`;
}

function getRangeFromFilters(filters = {}) {
  return getDateRange(filters);
}

module.exports = {
  SUPPORTED_PERIODS,
  SUPPORTED_GRANULARITY,
  SUPPORTED_DIMENSIONS,
  SUPPORTED_TOP_CATEGORIES,
  toNumber,
  ratio,
  growthRate,
  buildNamedRange,
  getDateRange,
  getPreviousRange,
  resolveGranularity,
  normalizeKey,
  formatRange,
  buildTimeKey,
  getRangeFromFilters,
};
