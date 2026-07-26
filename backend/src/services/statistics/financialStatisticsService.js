const statisticsRepository = require("./statisticsRepository");
const {
  toNumber,
  ratio,
  growthRate,
  buildNamedRange,
  getPreviousRange,
  formatRange,
  getRangeFromFilters,
  getDateRange,
} = require("./statisticsCore");

function computeSaleCost(sale) {
  return toNumber(sale.totalAmount) - toNumber(sale.profit);
}

function formatSaleSummary(sale) {
  if (!sale) {
    return null;
  }

  const revenue = toNumber(sale.totalAmount);
  const grossProfit = toNumber(sale.profit);
  const cost = computeSaleCost(sale);

  return {
    id: sale.id,
    orderNumber: sale.orderNumber,
    soldAt: sale.soldAt,
    platform: sale.platform,
    chiffreAffaires: revenue,
    benefice: grossProfit,
    marge: ratio(grossProfit, revenue),
    roi: ratio(grossProfit, cost),
    quantiteVendue: toNumber(sale.totalItems),
  };
}

function computeFinancialMetricsFromAggregate(aggregate, extras = {}) {
  const revenueTTC = toNumber(aggregate?._sum?.totalAmount);
  const taxes = toNumber(aggregate?._sum?.taxes);
  const shippingCost = toNumber(aggregate?._sum?.shippingCost);
  const platformFees = toNumber(aggregate?._sum?.platformFees);
  const grossProfit = toNumber(aggregate?._sum?.profit);
  const soldQuantity = toNumber(aggregate?._sum?.totalItems);
  const salesCount = toNumber(aggregate?._count?.id);
  const purchaseCost = revenueTTC - grossProfit;
  const revenueHT = Math.max(0, revenueTTC - taxes);
  const netProfit = grossProfit - shippingCost - platformFees;

  return {
    chiffreAffairesHT: revenueHT,
    chiffreAffairesTTC: revenueTTC,
    coutAchat: purchaseCost,
    beneficeBrut: grossProfit,
    beneficeNet: netProfit,
    margeEur: grossProfit,
    margePct: ratio(grossProfit, revenueTTC),
    roiPct: ratio(grossProfit, purchaseCost),
    ticketMoyen: salesCount > 0 ? revenueTTC / salesCount : 0,
    panierMoyen: salesCount > 0 ? soldQuantity / salesCount : 0,
    quantiteVendue: soldQuantity,
    nombreVentes: salesCount,
    nombreCartesVendues: soldQuantity,
    nombreMoyenCartesParVente: salesCount > 0 ? soldQuantity / salesCount : 0,
    prixMoyenAchat: soldQuantity > 0 ? purchaseCost / soldQuantity : 0,
    prixMoyenVente: soldQuantity > 0 ? revenueTTC / soldQuantity : 0,
    plusGrosseVente: formatSaleSummary(extras.plusGrosseVente),
    plusGrosBenefice: formatSaleSummary(extras.plusGrosBenefice),
    ventePlusRentable: formatSaleSummary(extras.ventePlusRentable),
    venteMoinsRentable: formatSaleSummary(extras.venteMoinsRentable),
    taxes,
    fraisPlateforme: platformFees,
    fraisExpedition: shippingCost,
    chiffreAffaires: revenueTTC,
    marge: {
      valeur: grossProfit,
      pourcentage: ratio(grossProfit, revenueTTC),
    },
    roi: ratio(grossProfit, purchaseCost),
  };
}

async function getFinancialIndicators(filters = {}) {
  const range = getRangeFromFilters(filters);
  const [aggregate, topSaleAmount, topSaleProfit, profitabilitySales] = await Promise.all([
    statisticsRepository.getSalesAggregate(range),
    statisticsRepository.getTopSaleByAmount(range),
    statisticsRepository.getTopSaleByProfit(range),
    statisticsRepository.getSalesProfitabilityEntries(range),
  ]);

  let bestRoiSale = null;
  let worstRoiSale = null;
  let bestRoi = Number.NEGATIVE_INFINITY;
  let worstRoi = Number.POSITIVE_INFINITY;

  for (const sale of profitabilitySales) {
    const cost = computeSaleCost(sale);
    const saleRoi = cost > 0 ? ratio(sale.profit, cost) : (toNumber(sale.profit) > 0 ? 999999 : 0);

    if (saleRoi > bestRoi) {
      bestRoi = saleRoi;
      bestRoiSale = sale;
    }

    if (saleRoi < worstRoi) {
      worstRoi = saleRoi;
      worstRoiSale = sale;
    }
  }

  return {
    range: formatRange(range),
    metrics: computeFinancialMetricsFromAggregate(aggregate, {
      plusGrosseVente: topSaleAmount,
      plusGrosBenefice: topSaleProfit,
      ventePlusRentable: bestRoiSale,
      venteMoinsRentable: worstRoiSale,
    }),
  };
}

function buildTemporalComparaison(currentMetrics, previousMetrics) {
  return {
    chiffreAffairesHT: growthRate(currentMetrics.chiffreAffairesHT, previousMetrics.chiffreAffairesHT),
    chiffreAffairesTTC: growthRate(currentMetrics.chiffreAffairesTTC, previousMetrics.chiffreAffairesTTC),
    coutAchat: growthRate(currentMetrics.coutAchat, previousMetrics.coutAchat),
    beneficeBrut: growthRate(currentMetrics.beneficeBrut, previousMetrics.beneficeBrut),
    beneficeNet: growthRate(currentMetrics.beneficeNet, previousMetrics.beneficeNet),
    ticketMoyen: growthRate(currentMetrics.ticketMoyen, previousMetrics.ticketMoyen),
    panierMoyen: growthRate(currentMetrics.panierMoyen, previousMetrics.panierMoyen),
    margePct: growthRate(currentMetrics.margePct, previousMetrics.margePct),
    roiPct: growthRate(currentMetrics.roiPct, previousMetrics.roiPct),
    chiffreAffaires: growthRate(currentMetrics.chiffreAffairesTTC, previousMetrics.chiffreAffairesTTC),
    benefice: growthRate(currentMetrics.beneficeBrut, previousMetrics.beneficeBrut),
    roi: growthRate(currentMetrics.roiPct, previousMetrics.roiPct),
    marge: growthRate(currentMetrics.margePct, previousMetrics.margePct),
    nombreVentes: growthRate(currentMetrics.nombreVentes, previousMetrics.nombreVentes),
    quantiteVendue: growthRate(currentMetrics.quantiteVendue, previousMetrics.quantiteVendue),
  };
}

async function buildTemporalSlice(range) {
  const previousRange = getPreviousRange(range);
  const [currentAggregate, previousAggregate] = await Promise.all([
    statisticsRepository.getSalesAggregate(range),
    statisticsRepository.getSalesAggregate(previousRange),
  ]);

  const currentMetrics = computeFinancialMetricsFromAggregate(currentAggregate);
  const previousMetrics = computeFinancialMetricsFromAggregate(previousAggregate);

  return {
    range: formatRange(range),
    previousRange: {
      from: previousRange.from.toISOString(),
      to: previousRange.to.toISOString(),
    },
    current: currentMetrics,
    previous: previousMetrics,
    comparaison: buildTemporalComparaison(currentMetrics, previousMetrics),
  };
}

async function getTemporalAnalysis(filters = {}) {
  const now = new Date();
  const ranges = {
    today: buildNamedRange("today", now),
    yesterday: buildNamedRange("yesterday", now),
    thisWeek: buildNamedRange("week", now),
    previousWeek: buildNamedRange("previous-week", now),
    thisMonth: buildNamedRange("month", now),
    previousMonth: buildNamedRange("previous-month", now),
    thisYear: buildNamedRange("year", now),
    previousYear: buildNamedRange("previous-year", now),
  };

  const results = {};
  const entries = Object.entries(ranges);

  await Promise.all(
    entries.map(async ([key, range]) => {
      results[key] = await buildTemporalSlice(range);
    })
  );

  if ((filters.from && filters.to) || filters.period === "custom") {
    const customRange = getDateRange({ period: "custom", from: filters.from, to: filters.to });
    results.custom = await buildTemporalSlice(customRange);
  }

  results.week = results.thisWeek;
  results.month = results.thisMonth;
  results.year = results.thisYear;

  return results;
}

module.exports = {
  getFinancialIndicators,
  getTemporalAnalysis,
};
