import api from "./api";
import { getInventory } from "./inventoryService";
import { getSales } from "./salesService";
import { getPurchases } from "./purchaseService";
import { getExpenses } from "./expensesService";
import { getCustomers } from "./customersService";

const API_URL = "/dashboard";

/**
 * Get comprehensive dashboard data by composing calls to existing endpoints
 */
export async function getDashboardData() {
  try {
    // Fetch all required data in parallel
    const [inventory, sales, purchases, expenses, customers] = await Promise.all([
      getInventory(),
      getSales(),
      getPurchases(),
      getExpenses(),
      getCustomers(),
    ]);

    // Calculate aggregated metrics
    const stockValue = inventory.reduce((sum, item) => sum + (item.quantityOnHand * item.unitCost || 0), 0);
    const stockCount = inventory.reduce((sum, item) => sum + (item.quantityOnHand || 0), 0);
    const lowStockItems = inventory.filter((item) => item.quantityOnHand < (item.reorderLevel || 10));

    const saleCount = sales.length;
    const revenue = sales.reduce((sum, sale) => sum + (parseFloat(sale.totalAmount) || 0), 0);
    const itemsSold = sales.reduce((sum, sale) => sum + (sale.saleItems?.length || 0), 0);

    const purchaseCount = purchases.length;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const purchasesThisMonth = purchases.filter((p) =>
      p.purchasedAt?.startsWith(currentMonth)
    );
    const purchaseAmount = purchasesThisMonth.reduce((sum, p) => sum + (parseFloat(p.totalAmount) || 0), 0);

    const expenseCount = expenses.length;
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amountTTC) || 0), 0);

    const customerCount = customers.length;

    // Calculate margin
    const expenseRatio = revenue > 0 ? (totalExpenses / revenue) * 100 : 0;
    const margin = revenue - totalExpenses;
    const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;

    // Get recent data (last 10 items) with normalized field names
    const recentSales = sales.slice(0, 10).map(sale => ({
      ...sale,
      saleDate: sale.soldAt
    }));
    const recentPurchases = purchases.slice(0, 10).map(purchase => ({
      ...purchase,
      purchaseDate: purchase.purchasedAt
    }));
    const recentExpenses = expenses.slice(0, 10);

    // Get expense categories distribution
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const category = expense.category || "OTHER";
      acc[category] = (acc[category] || 0) + (parseFloat(expense.amountTTC) || 0);
      return acc;
    }, {});

    return {
      stats: {
        stockValue,
        stockCount,
        saleCount,
        purchaseCount,
        expenseCount,
        customerCount,
      },
      cards: {
        revenue,
        expenses: totalExpenses,
        margin,
        marginPercent,
        itemsSold,
        purchasesThisMonth: purchaseAmount,
      },
      recentSales,
      recentPurchases,
      recentExpenses,
      lowStockItems,
      expensesByCategory,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

/**
 * Refresh dashboard data
 */
export async function refreshDashboard() {
  return getDashboardData();
}
