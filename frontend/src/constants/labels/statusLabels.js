/**
 * Traductions centralisées des statuts générique
 */
export const STATUS_LABELS = {
  PENDING: "En attente",
  PARTIALLY_RECEIVED: "Réception partielle",
  RECEIVED: "Reçue",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
  PAID: "Payée",
  UNPAID: "Non payée",
};

export const getStatusLabel = (status) => {
  return STATUS_LABELS[status] || status;
};
