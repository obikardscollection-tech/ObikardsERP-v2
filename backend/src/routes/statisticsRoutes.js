const express = require("express");

const statisticsController = require("../controllers/statisticsController");

const router = express.Router();

router.get("/financial", statisticsController.getFinancialIndicators);
router.get("/temporal", statisticsController.getTemporalAnalysis);
router.get("/stock", statisticsController.getStockStatistics);

router.get("/business/:dimension", statisticsController.getBusinessAnalysis);
router.get("/business-distributions", statisticsController.getBusinessDistributions);
router.get("/charts-overview", statisticsController.getChartsOverview);

router.get("/tops/:category", statisticsController.getTopRanking);

router.get("/charts/revenue-evolution", statisticsController.getRevenueEvolution);
router.get("/charts/profit-evolution", statisticsController.getProfitEvolution);
router.get("/charts/margin-evolution", statisticsController.getMarginEvolution);
router.get("/charts/roi-evolution", statisticsController.getRoiEvolution);
router.get("/charts/sales-evolution", statisticsController.getSalesEvolution);
router.get("/charts/purchases-evolution", statisticsController.getPurchasesEvolution);
router.get("/charts/stock-evolution", statisticsController.getStockEvolution);
router.get("/charts/sales-distribution", statisticsController.getSalesDistribution);
router.get("/charts/benefits-distribution", statisticsController.getBenefitsDistribution);
router.get("/charts/stock-distribution", statisticsController.getStockDistribution);
router.get("/charts/sales-by-sport", statisticsController.getSalesBySport);
router.get("/charts/sales-by-player", statisticsController.getSalesByPlayer);
router.get("/charts/sales-by-brand", statisticsController.getSalesByBrand);
router.get("/charts/sales-by-supplier", statisticsController.getSalesBySupplier);
router.get("/charts/sales-by-platform", statisticsController.getSalesByPlatform);
router.get("/charts/sales-by-year", statisticsController.getSalesByYear);

router.get("/market", statisticsController.getMarketAnalysis);

module.exports = router;