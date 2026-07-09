/**
 * Traductions centralisées des libellés communs
 */
export const COMMON_LABELS = {
  LOADING: "Chargement...",
  ERROR: "Erreur",
  SUCCESS: "Succès",
  CANCEL: "Annuler",
  DELETE: "Supprimer",
  EDIT: "Modifier",
  ADD: "Ajouter",
  VIEW: "Voir",
  BACK: "Retour",
  SAVE: "Enregistrer",
  CLOSE: "Fermer",
  NO_DATA: "Aucune donnée",
  ACTIONS: "Actions",
  REFRESH: "Actualiser",
  FILTER: "Filtrer",
  RESET: "Réinitialiser",
  SEARCH: "Rechercher",
  TOTAL: "Total",
  AMOUNT: "Montant",
  DATE: "Date",
  STATUS: "Statut",
  QUANTITY: "Quantité",
  PAID: "Payée",
  PENDING: "En attente",
  REFUNDED: "Remboursée",
};

export const getCommonLabel = (key) => {
  return COMMON_LABELS[key] || key;
};
