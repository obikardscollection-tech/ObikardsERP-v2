const assert = require("node:assert/strict");
const { test } = require("node:test");
const expenses = require("../src/services/expenses");
const { getDashboardData } = require("../src/services/dashboard/dashboardService");
const statistics = require("../src/services/statistics");
const prisma = require("../src/lib/prisma");
const { uniqueLabel } = require("./erpTestFixtures");

function expensePayload(marker, overrides = {}) {
  return {
    category: "OTHER",
    title: marker,
    amountHT: 10,
    tax: 2,
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    expenseDate: new Date(),
    notes: marker,
    ...overrides,
  };
}

test("Expenses, Dashboard, and Statistics regression", async (t) => {
  const expenseIds = [];

  try {
    await t.test("expense CRUD enforces HT, tax, and TTC", async () => {
      const marker = uniqueLabel("EXPENSE");
      const created = await expenses.createExpense(expensePayload(marker));
      expenseIds.push(created.id);
      assert.equal(Number(created.amountHT), 10);
      assert.equal(Number(created.tax), 2);
      assert.equal(Number(created.amountTTC), 12);
      assert.equal((await expenses.getExpense(created.id)).id, created.id);
      assert.ok((await expenses.searchExpenses(marker, 10)).some(({ id }) => id === created.id));
      const updated = await expenses.updateExpense(created.id, { amountHT: 20, tax: 4 });
      assert.equal(Number(updated.amountHT), 20);
      assert.equal(Number(updated.tax), 4);
      assert.equal(Number(updated.amountTTC), 24);
      await assert.rejects(
        () => expenses.updateExpense(created.id, { amountHT: 20, tax: 4, amountTTC: 25 }),
        /HT \+ TVA/i
      );
      await expenses.deleteExpense(created.id);
      expenseIds.splice(expenseIds.indexOf(created.id), 1);
      assert.equal(await prisma.expense.count({ where: { id: created.id } }), 0);
    });

    await t.test("expense is reflected in Dashboard and Statistics aggregates", async () => {
      const before = await getDashboardData({ period: "30d" });
      const created = await expenses.createExpense(expensePayload(uniqueLabel("AGGREGATE")));
      expenseIds.push(created.id);
      const after = await getDashboardData({ period: "30d" });
      assert.equal(after.overview.totalExpensesCount, before.overview.totalExpensesCount + 1);
      assert.equal(after.overview.totalExpensesAmount, before.overview.totalExpensesAmount + 12);
      assert.equal(after.overview.operatingBalance, before.overview.operatingBalance - 12);
      assert.ok(after.charts);
      assert.ok(after.breakdowns);

      const [financial, stock, distributions, charts] = await Promise.all([
        statistics.getFinancialIndicators({ period: "month" }),
        statistics.getStockStatistics({ period: "month" }),
        statistics.getBusinessDistributions({ period: "month" }),
        statistics.getChartsOverview({ period: "month" }),
      ]);
      assert.ok(financial.metrics);
      assert.ok(stock);
      assert.ok(distributions);
      assert.ok(charts);
    });
  } finally {
    await prisma.expense.deleteMany({ where: { id: { in: expenseIds } } });
    await prisma.$disconnect();
  }
});