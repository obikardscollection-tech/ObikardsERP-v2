export function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function formatPercent(value) {
  return `${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)}%`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function formatValue(value, format) {
  if (format === "currency") {
    return formatCurrency(value);
  }

  if (format === "percent") {
    return formatPercent(value);
  }

  return formatNumber(value);
}

export function formatVariation(value) {
  const numericValue = Number(value) || 0;
  const prefix = numericValue > 0 ? "+" : "";

  return `${prefix}${formatPercent(numericValue)}`;
}

export function getVariationClasses(value) {
  const numericValue = Number(value) || 0;

  if (numericValue > 0) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (numericValue < 0) {
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  }

  return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
}