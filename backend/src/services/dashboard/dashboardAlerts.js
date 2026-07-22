function buildAlerts({
  lowQuantityCount,
  invalidQuantityCount,
  salesCount,
  purchasesCount,
  netCashFlow,
  expenseGrowthRate,
  expensesCount,
  cancelledSalesRatio,
  salesGrowthRate,
  previousSalesAmount,
}) {
  const alerts = [];

  if (lowQuantityCount > 0) {
    alerts.push({
      id: "low-quantity",
      level: "warning",
      title: "Stock faible",
      message: `${lowQuantityCount} article(s) en stock avec une quantite <= 1.`,
    });
  }

  if (invalidQuantityCount > 0) {
    alerts.push({
      id: "invalid-quantity",
      level: "danger",
      title: "Quantites negatives detectees",
      message: `${invalidQuantityCount} article(s) ont une quantite negative.`,
    });
  }

  if (salesCount === 0 && purchasesCount > 0) {
    alerts.push({
      id: "no-sales-period",
      level: "warning",
      title: "Aucune vente sur la periode",
      message: "Des achats ont ete identifies mais aucune vente n'a ete enregistree sur la plage selectionnee.",
    });
  }

  if (netCashFlow < 0) {
    alerts.push({
      id: "negative-cash-flow",
      level: "danger",
      title: "Cash-flow negatif",
      message: "Le solde ventes - achats - depenses est negatif sur la periode selectionnee.",
    });
  }

  if (expenseGrowthRate >= 35 && expensesCount >= 3) {
    alerts.push({
      id: "expense-spike",
      level: "warning",
      title: "Hausse importante des depenses",
      message: `Les depenses progressent de ${expenseGrowthRate.toFixed(1)}% par rapport a la periode precedente.`,
    });
  }

  if (cancelledSalesRatio >= 20 && salesCount >= 5) {
    alerts.push({
      id: "cancelled-sales-ratio",
      level: "warning",
      title: "Taux d'annulation eleve",
      message: `${cancelledSalesRatio.toFixed(1)}% des ventes de la periode sont annulees.`,
    });
  }

  if (salesGrowthRate <= -40 && previousSalesAmount > 0) {
    alerts.push({
      id: "sales-drop",
      level: "danger",
      title: "Baisse brutale des ventes",
      message: `Le chiffre d'affaires baisse de ${Math.abs(salesGrowthRate).toFixed(1)}% vs periode precedente.`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "healthy",
      level: "success",
      title: "Alerte operationnelle",
      message: "Aucune alerte prioritaire detectee sur les donnees disponibles.",
    });
  }

  return alerts;
}

module.exports = {
  buildAlerts,
};
