const PERIOD_CONFIG = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "365d": 365,
};

const SUPPORTED_PERIODS = ["7d", "30d", "90d", "365d", "custom"];
const SUPPORTED_GRANULARITY = ["day", "week", "month"];

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

function normalizeDateInput(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (dateOnlyMatch) {
      const [, yearText, monthText, dayText] = dateOnlyMatch;
      const year = Number(yearText);
      const month = Number(monthText);
      const day = Number(dayText);
      const parsedDate = new Date(year, month - 1, day);

      if (
        parsedDate.getFullYear() !== year
        || parsedDate.getMonth() !== month - 1
        || parsedDate.getDate() !== day
      ) {
        return null;
      }

      return parsedDate;
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function addDays(date, days) {
  const output = new Date(date);
  output.setDate(output.getDate() + days);
  return output;
}

function parseDateRange(filters = {}) {
  const period = filters.period || "30d";
  const now = new Date();
  const defaultEnd = endOfDay(now);

  if (!SUPPORTED_PERIODS.includes(period)) {
    const error = new Error(`Periode non supportee: ${period}`);
    error.statusCode = 400;
    throw error;
  }

  if (period === "custom") {
    const fromDate = normalizeDateInput(filters.from);
    const toDate = normalizeDateInput(filters.to);

    if (!fromDate || !toDate) {
      const error = new Error("Les dates from et to sont obligatoires pour une periode custom.");
      error.statusCode = 400;
      throw error;
    }

    if (fromDate > toDate) {
      const error = new Error("La date from doit etre inferieure ou egale a to.");
      error.statusCode = 400;
      throw error;
    }

    return {
      period,
      from: startOfDay(fromDate),
      to: endOfDay(toDate),
    };
  }

  const days = PERIOD_CONFIG[period];
  const from = startOfDay(addDays(now, -(days - 1)));

  return {
    period,
    from,
    to: defaultEnd,
  };
}

function isInRange(value, range) {
  const date = normalizeDateInput(value);
  if (!date) {
    return false;
  }

  return date >= range.from && date <= range.to;
}

function getPreviousRange(range) {
  const duration = range.to.getTime() - range.from.getTime();
  const prevTo = new Date(range.from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - duration);

  return {
    from: prevFrom,
    to: prevTo,
  };
}

function resolveGranularity(range, requestedGranularity) {
  if (SUPPORTED_GRANULARITY.includes(requestedGranularity)) {
    return requestedGranularity;
  }

  const daySpan = Math.ceil((range.to.getTime() - range.from.getTime()) / 86400000);
  if (daySpan > 180) {
    return "month";
  }
  if (daySpan > 60) {
    return "week";
  }
  return "day";
}

function splitByRanges(items, getDateValue, range, previousRange) {
  const current = [];
  const previous = [];

  for (const item of items) {
    const dateValue = getDateValue(item);

    if (isInRange(dateValue, range)) {
      current.push(item);
      continue;
    }

    if (isInRange(dateValue, previousRange)) {
      previous.push(item);
    }
  }

  return {
    current,
    previous,
  };
}

module.exports = {
  SUPPORTED_PERIODS,
  SUPPORTED_GRANULARITY,
  parseDateRange,
  getPreviousRange,
  resolveGranularity,
  splitByRanges,
};
