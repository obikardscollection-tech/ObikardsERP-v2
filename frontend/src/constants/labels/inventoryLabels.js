/**
 * Traductions centralisées pour l'inventaire
 * Catégories et statuts des articles
 */

export const INVENTORY_CATEGORY_LABELS = {
  NBA: "NBA",
  NFL: "NFL",
  MLB: "MLB",
  NHL: "NHL",
  Soccer: "Football",
  Tennis: "Tennis",
  UFC: "UFC",
  Boxing: "Boxe",
  Pokémon: "Pokémon",
  "Magic: The Gathering": "Magic: The Gathering",
  "Yu-Gi-Oh": "Yu-Gi-Oh",
  "Autres TCG": "Autres TCG",
  "Jeux Vidéo": "Jeux Vidéo",
  Cinéma: "Cinéma",
  Musique: "Musique",
  Célébrités: "Célébrités",
  Automobiles: "Automobiles",
  Antiquités: "Antiquités",
  Autre: "Autre",
  PURCHASED: "Acheté",
};

export const getInventoryCategoryLabel = (category) => {
  return INVENTORY_CATEGORY_LABELS[category] || category;
};

export const INVENTORY_STATUS_LABELS = {
  IN_STOCK: "En stock",
  SOLD: "Vendu",
  RESERVED: "Réservé",
  DAMAGED: "Endommagé",
  PENDING: "En attente",
  CONSIGNMENT: "En consignation",
  GRADING: "En grading",
  TO_SHIP: "À expédier",
  SHIPPED: "Expédiée",
};

export const getInventoryStatusLabel = (status) => {
  return INVENTORY_STATUS_LABELS[status] || status;
};

export const STOCK_MOVEMENT_TYPE_LABELS = {
  ADJUSTMENT: "Ajustement",
  PURCHASE: "Achat",
  SALE: "Vente",
  RETURN: "Retour",
  CORRECTION: "Correction",
};

export const getStockMovementTypeLabel = (type) => {
  return STOCK_MOVEMENT_TYPE_LABELS[type] || type;
};
