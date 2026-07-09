/**
 * Traductions centralisées des sources d'achat
 */
export const PURCHASE_SOURCE_LABELS = {
  SUPPLIER: "Fournisseur",
  INDIVIDUAL: "Particulier",
  CARD_SHOW: "Salon",
  MARKETPLACE: "Marketplace",
  DIRECT: "Achat direct",
  OTHER: "Autre",
};

export const getPurchaseSourceLabel = (source) => {
  return PURCHASE_SOURCE_LABELS[source] || source;
};
