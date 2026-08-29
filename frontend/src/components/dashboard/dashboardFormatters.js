export function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(Number(value) || 0);
}

export function formatPercent(value) {
  return `${(Number(value) || 0).toFixed(1)}%`;
}

export function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("fr-FR");
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateLabel(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}
