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
  OTHER: "Autre",
};

export const getExpenseCategoryLabel = (category) => {
  return EXPENSE_CATEGORY_LABELS[category] || category;
};
