/**
 * Traductions centralisées des statuts d'achat (Purchase status)
 */
export const PURCHASE_STATUS_LABELS = {
  PENDING: "En attente",
  PARTIALLY_RECEIVED: "Réception partielle",
  RECEIVED: "Reçue",
  CANCELLED: "Annulée",
};

export const getPurchaseStatusLabel = (status) => {
  return PURCHASE_STATUS_LABELS[status] || status;
};
