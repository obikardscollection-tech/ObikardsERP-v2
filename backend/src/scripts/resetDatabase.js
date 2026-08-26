const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // Deleting data in the correct order to respect foreign key constraints
      const results = [];

      // Delete SaleItems first
      const saleItems = await tx.saleItem.deleteMany({});
      results.push({ model: 'SaleItem', count: saleItems.count });

      // Delete Sales
      const sales = await tx.sale.deleteMany({});
      results.push({ model: 'Sale', count: sales.count });

      // Delete ReceptionItems
      const receptionItems = await tx.receptionItem.deleteMany({});
      results.push({ model: 'ReceptionItem', count: receptionItems.count });

      // Delete Receptions
      const receptions = await tx.reception.deleteMany({});
      results.push({ model: 'Reception', count: receptions.count });

      // Delete PurchaseItems
      const purchaseItems = await tx.purchaseItem.deleteMany({});
      results.push({ model: 'PurchaseItem', count: purchaseItems.count });

      // Delete Purchases
      const purchases = await tx.purchase.deleteMany({});
      results.push({ model: 'Purchase', count: purchases.count });

      // Delete StockMovements
      const stockMovements = await tx.stockMovement.deleteMany({});
      results.push({ model: 'StockMovement', count: stockMovements.count });

      // Delete Expenses
      const expenses = await tx.expense.deleteMany({});
      results.push({ model: 'Expense', count: expenses.count });

      // Delete Customers
      const customers = await tx.customer.deleteMany({});
      results.push({ model: 'Customer', count: customers.count });

      // Delete Suppliers
      const suppliers = await tx.supplier.deleteMany({});
      results.push({ model: 'Supplier', count: suppliers.count });

      // Delete InventoryMarketSnapshots
      const inventoryMarketSnapshots = await tx.inventoryMarketSnapshot.deleteMany({});
      results.push({ model: 'InventoryMarketSnapshot', count: inventoryMarketSnapshots.count });

      // Delete MarketAnalytics
      const marketAnalytics = await tx.marketAnalytics.deleteMany({});
      results.push({ model: 'MarketAnalytics', count: marketAnalytics.count });

      // Delete MarketHistory
      const marketHistory = await tx.marketHistory.deleteMany({});
      results.push({ model: 'MarketHistory', count: marketHistory.count });

      // Delete MarketImportErrors
      const marketImportErrors = await tx.marketImportError.deleteMany({});
      results.push({ model: 'MarketImportError', count: marketImportErrors.count });

      // Delete MarketImportJobs
      const marketImportJobs = await tx.marketImportJob.deleteMany({});
      results.push({ model: 'MarketImportJob', count: marketImportJobs.count });

      // Delete MarketProviderCards
      const marketProviderCards = await tx.marketProviderCard.deleteMany({});
      results.push({ model: 'MarketProviderCard', count: marketProviderCards.count });

      // Delete MarketSnapshots
      const marketSnapshots = await tx.marketSnapshot.deleteMany({});
      results.push({ model: 'MarketSnapshot', count: marketSnapshots.count });

      // Delete Inventory
      const inventory = await tx.inventory.deleteMany({});
      results.push({ model: 'Inventory', count: inventory.count });

      // Output results
      results.forEach(result => {
        console.log(`✔ ${result.model} : ${result.count} supprimés`);
      });
    });

    console.log("========================================");
    console.log("Base ERP Obikards nettoyée avec succès.");
    console.log("Toutes les données de test ont été supprimées.");
    console.log("Référentiels permanents conservés.");
    console.log("Structure Prisma inchangée.");
    console.log("ERP prêt pour la production.");
  } catch (error) {
    console.error("Erreur lors du nettoyage de la base :", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
