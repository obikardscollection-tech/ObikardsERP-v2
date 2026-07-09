/**
 * Traductions centralisées des plateformes/sources d'achat
 */
export const PURCHASE_SOURCE_LABELS = {
  EBAY: "eBay",
  WHATNOT: "Whatnot",
  WOOCOMMERCE: "WooCommerce",
  CARDMARKET: "CardMarket",
  WEBSITE: "Site web",
  DIRECT: "Achat direct",
  CARD_SHOW: "Salon",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  SHOP: "Boutique",
  DISTRIBUTOR: "Distributeur",
  OTHER: "Autre",
};

export const getPurchaseSourceLabel = (source) => {
  return PURCHASE_SOURCE_LABELS[source] || source;
};
