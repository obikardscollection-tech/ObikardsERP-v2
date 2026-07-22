export function getReceptionStatus(reception) {
  if (!reception) {
    return "PENDING";
  }

  if (Number(reception.remainingQuantity || 0) <= 0) {
    return "COMPLETED";
  }

  if (Number(reception.totalQuantity || 0) <= 0) {
    return "PENDING";
  }

  return "PARTIALLY_RECEIVED";
}

export function formatReceptionDate(value, locale = "fr-FR") {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString(locale);
}

export function formatReceptionDateTime(value, locale = "fr-FR") {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString(locale);
}

export function getReceptionSupplierName(reception) {
  return reception?.purchase?.supplier?.name || reception?.purchase?.supplier?.company || "-";
}