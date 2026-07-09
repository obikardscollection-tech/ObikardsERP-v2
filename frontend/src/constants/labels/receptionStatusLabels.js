/**
 * Traductions centralisées des statuts de réception
 */
export const RECEPTION_STATUS_LABELS = {
  PENDING: "En attente",
  PARTIALLY_RECEIVED: "Réception partielle",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

export const getReceptionStatusLabel = (status) => {
  return RECEPTION_STATUS_LABELS[status] || status;
};
