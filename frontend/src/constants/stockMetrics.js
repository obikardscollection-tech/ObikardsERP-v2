import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "../utils/statisticsFormatter";

export const stockMetricsCards = [
  {
    label: "Cartes en stock",
    getValue: (metrics) => formatNumber(metrics.nombreTotalCartes),
  },
  {
    label: "Quantite totale",
    getValue: (metrics) => formatNumber(metrics.quantiteTotale),
  },
  {
    label: "Valeur marche stock",
    getValue: (metrics) => formatCurrency(metrics.valeurMarcheStock),
  },
  {
    label: "Benefice potentiel",
    getValue: (metrics) => formatCurrency(metrics.beneficePotentiel),
  },
  {
    label: "ROI potentiel",
    getValue: (metrics) => formatPercent(metrics.roiPotentiel),
  },
  {
    label: "Rotation stock",
    getValue: (metrics) => formatPercent(metrics.rotationStock),
  },
];