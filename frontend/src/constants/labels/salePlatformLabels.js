/**
 * Traductions centralisées des plateformes de vente
 */
export const SALE_PLATFORM_LABELS = {
  EBAY: "eBay",
  WHATNOT: "Whatnot",
  DIRECT: "Vente directe",
  CARD_SHOW: "Salon",
  WEBSITE: "Site internet",
  INSTAGRAM: "Instagram",
  WOOCOMMERCE: "Boutique",
  OTHER: "Autre",
};

export const getSalePlatformLabel = (platform) => {
  return SALE_PLATFORM_LABELS[platform] || platform;
};
