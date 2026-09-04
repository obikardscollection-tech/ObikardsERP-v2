const inventoryRoutes = require("./inventoryRoutes");
const stockMovementRoutes = require("./stockMovementRoutes");
const salesRoutes = require("./salesRoutes");
const customersRoutes = require("./customersRoutes");
const suppliersRoutes = require("./suppliersRoutes");
const purchasesRoutes = require("./purchasesRoutes");
const expensesRoutes = require("./expensesRoutes");
const receptionsRoutes = require("./receptionsRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const statisticsRoutes = require("./statisticsRoutes");
const searchRoutes = require("./searchRoutes");
const marketProviderRoutes = require("./marketProviderRoutes");
const marketCardRoutes = require("./marketCardRoutes");
const marketProviderCardRoutes = require("./marketProviderCardRoutes");
const marketSnapshotRoutes = require("./marketSnapshotRoutes");
const marketHistoryRoutes = require("./marketHistoryRoutes");
const marketAnalyticsRoutes = require("./marketAnalyticsRoutes");
const marketReferenceRoutes = require("./marketReferenceRoutes");
const marketImportJobRoutes = require("./marketImportJobRoutes");
const marketImportErrorRoutes = require("./marketImportErrorRoutes");
const backupRoutes = require("./backupRoutes");

const routes = [
  ["/inventory", inventoryRoutes],
  ["/stock-movements", stockMovementRoutes],
  ["/sales", salesRoutes],
  ["/customers", customersRoutes],
  ["/suppliers", suppliersRoutes],
  ["/purchases", purchasesRoutes],
  ["/expenses", expensesRoutes],
  ["/receptions", receptionsRoutes],
  ["/dashboard", dashboardRoutes],
  ["/statistics", statisticsRoutes],
  ["/search", searchRoutes],
  ["/market/providers", marketProviderRoutes],
  ["/market/cards", marketCardRoutes],
  ["/market/provider-cards", marketProviderCardRoutes],
  ["/market/snapshots", marketSnapshotRoutes],
  ["/market/history", marketHistoryRoutes],
  ["/market/analytics", marketAnalyticsRoutes],
  ["/market/references", marketReferenceRoutes],
  ["/market/import-jobs", marketImportJobRoutes],
  ["/market/import-errors", marketImportErrorRoutes],
  ["/backups", backupRoutes],
];

function registerBusinessRoutes(app) {
  for (const [path, router] of routes) app.use(path, router);
}

module.exports = {
  registerBusinessRoutes,
  routes,
};