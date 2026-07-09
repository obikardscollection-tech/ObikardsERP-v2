/**
 * Traductions centralisées des catégories de dépenses
 */
export const EXPENSE_CATEGORY_LABELS = {
  OFFICE: "Bureau",
  SUPPLIES: "Fournitures",
  SHIPPING: "Expédition",
  MARKETING: "Marketing",
  TRAVEL: "Déplacements",
  EVENT: "Salon",
  SOFTWARE: "Logiciels",
  FUEL: "Carburant",
  BANK: "Frais bancaires",
  ACCOUNTING: "Comptabilité",
  INSURANCE: "Assurance",
  RENT: "Loyer",
  PHONE: "Téléphone",
  INTERNET: "Internet",
  EBAY_FEES: "Frais eBay",
  WHATNOT_FEES: "Frais Whatnot",
  WOOCOMMERCE_FEES: "Frais WooCommerce",
  PAYPAL_FEES: "Frais PayPal",
  STRIPE_FEES: "Frais Stripe",
  SALARY: "Salaires",
  TRAINING: "Formation",
  OTHER: "Autre",
};

export const getExpenseCategoryLabel = (category) => {
  return EXPENSE_CATEGORY_LABELS[category] || category;
};
