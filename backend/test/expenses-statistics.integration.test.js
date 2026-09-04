const assert = require("node:assert/strict");
const { test } = require("node:test");
const expenses = require("../src/services/expenses");
const statistics = require("../src/services/statistics");
const prisma = require("../src/lib/prisma");
const { uniqueLabel } = require("./erpTestFixtures");

function customPeriod() {
  const now = new Date();
  return {
    period: "custom",
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  };
}

function expensePayload(overrides = {}) {
  return {
    category: "SOFTWARE",
    title: uniqueLabel("STAT_EXPENSE"),
    amountHT: 100,
    tax: 21,
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    expenseDate: new Date(),
    ...overrides,
  };
}

test("Expenses are included in Statistics", async (t) => {
  const expenseIds = [];
  const saleIds = [];

  async function createExpense(overrides) {
    const expense = await expenses.createExpense(expensePayload(overrides));
    expenseIds.push(expense.id);
    return expense;
  }

  try {
    await t.test("paid amounts appear in financial indicators", async () => {
      const expense = await createExpense();
      const financial = await statistics.getFinancialIndicators(customPeriod());
      assert.equal(financial.metrics.depensesHT, 100);
      assert.equal(financial.metrics.tvaDepenses, 21);
      assert.equal(financial.metrics.depensesTTC, 121);
      assert.equal(financial.metrics.nombreDepenses, 1);
      assert.equal(financial.metrics.resultatApresDepenses, -121);
      await expenses.deleteExpense(expense.id);
      expenseIds.splice(expenseIds.indexOf(expense.id), 1);
    });

    await t.test("period and payment status filters exclude ineligible expenses", async () => {
      const paid = await createExpense({ amountHT: 20, tax: 4 });
      const pending = await createExpense({ amountHT: 30, tax: 6, paymentStatus: "PENDING" });
      const refunded = await createExpense({ amountHT: 40, tax: 8, paymentStatus: "REFUNDED" });
      const outside = await createExpense({
        amountHT: 50,
        tax: 10,
        expenseDate: new Date(2000, 0, 15),
      });
      const financial = await statistics.getFinancialIndicators(customPeriod());
      assert.equal(financial.metrics.depensesTTC, 24);
      assert.equal(financial.metrics.nombreDepenses, 1);
      await prisma.expense.deleteMany({ where: { id: { in: [paid.id, pending.id, refunded.id, outside.id] } } });
      expenseIds.length = 0;
    });

    await t.test("Sales and Expenses produce a result after expenses", async () => {
      const sale = await prisma.sale.create({
        data: {
          orderNumber: uniqueLabel("STAT_SALE"),
          platform: "DIRECT",
          status: "COMPLETED",
          totalAmount: 200,
          profit: 80,
          taxes: 20,
          shippingCost: 5,
          platformFees: 10,
          soldAt: new Date(),
        },
      });
      saleIds.push(sale.id);
      const expense = await createExpense({ amountHT: 25, tax: 5 });
      const financial = await statistics.getFinancialIndicators(customPeriod());
      assert.equal(financial.metrics.beneficeNet, 65);
      assert.equal(financial.metrics.depensesTTC, 30);
      assert.equal(financial.metrics.resultatApresDepenses, 35);
      await prisma.sale.delete({ where: { id: sale.id } });
      saleIds.length = 0;
      await expenses.deleteExpense(expense.id);
      expenseIds.length = 0;
    });

    await t.test("Expense updates and deletions are reflected", async () => {
      const expense = await createExpense({ amountHT: 10, tax: 2 });
      await expenses.updateExpense(expense.id, { amountHT: 30, tax: 6 });
      const updated = await statistics.getFinancialIndicators(customPeriod());
      assert.equal(updated.metrics.depensesTTC, 36);
      await expenses.deleteExpense(expense.id);
      expenseIds.length = 0;
      const deleted = await statistics.getFinancialIndicators(customPeriod());
      assert.equal(deleted.metrics.depensesTTC, 0);
      assert.equal(deleted.metrics.nombreDepenses, 0);
    });

    await t.test("calendar periods expose current and previous Expense totals", async () => {
      const now = new Date();
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15, 12);
      await createExpense({ amountHT: 10, tax: 2 });
      await createExpense({ amountHT: 20, tax: 4, expenseDate: previousMonth });
      const temporal = await statistics.getTemporalAnalysis({ period: "month" });
      assert.equal(temporal.month.current.depensesTTC, 12);
      assert.equal(temporal.month.previous.depensesTTC, 24);
      assert.equal(temporal.month.comparaison.depensesTTC, -50);
      await prisma.expense.deleteMany({ where: { id: { in: expenseIds } } });
      expenseIds.length = 0;
    });

    await t.test("timeline and category distribution aggregate multiple expenses", async () => {
      await createExpense({ category: "SOFTWARE", amountHT: 40, tax: 8 });
      await createExpense({ category: "MARKETING", amountHT: 60, tax: 12 });
      await createExpense({ category: "SOFTWARE", amountHT: 10, tax: 2 });
      const charts = await statistics.getChartsOverview(customPeriod());
      assert.equal(charts.expenses.data.reduce((sum, row) => sum + row.value, 0), 132);
      assert.equal(charts.expenses.count.reduce((sum, row) => sum + row.value, 0), 3);
      assert.deepEqual(
        charts.distributions.expensesByCategory.map(({ category, depensesTTC, nombreDepenses }) => ({
          category,
          depensesTTC,
          nombreDepenses,
        })),
        [
          { category: "MARKETING", depensesTTC: 72, nombreDepenses: 1 },
          { category: "SOFTWARE", depensesTTC: 60, nombreDepenses: 2 },
        ]
      );
    });
  } finally {
    await prisma.expense.deleteMany({ where: { id: { in: expenseIds } } });
    await prisma.sale.deleteMany({ where: { id: { in: saleIds } } });
    await prisma.$disconnect();
  }
});