const { toNumber } = require("./dashboardUtils");

function formatBucketDate(date, granularity) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  if (granularity === "month") {
    return `${year}-${month}`;
  }

  if (granularity === "week") {
    const weekStart = new Date(d);
    const dayOfWeek = (weekStart.getDay() + 6) % 7;
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    return formatBucketDate(weekStart, "day");
  }

  return `${year}-${month}-${day}`;
}

function createTimelineAccumulator(granularity) {
  return {
    granularity,
    buckets: new Map(),
  };
}

function getOrCreateTimelineEntry(accumulator, date) {
  const key = formatBucketDate(date, accumulator.granularity);

  if (!accumulator.buckets.has(key)) {
    accumulator.buckets.set(key, {
      period: key,
      salesAmount: 0,
      purchasesAmount: 0,
      expensesAmount: 0,
      salesCount: 0,
      purchasesCount: 0,
      expensesCount: 0,
    });
  }

  return accumulator.buckets.get(key);
}

function addSaleToTimeline(accumulator, sale) {
  const entry = getOrCreateTimelineEntry(accumulator, sale.soldAt);
  entry.salesAmount += toNumber(sale.totalAmount);
  entry.salesCount += 1;
}

function addPurchaseToTimeline(accumulator, purchase) {
  const entry = getOrCreateTimelineEntry(accumulator, purchase.purchasedAt);
  entry.purchasesAmount += toNumber(purchase.totalAmount);
  entry.purchasesCount += 1;
}

function addExpenseToTimeline(accumulator, expense) {
  const entry = getOrCreateTimelineEntry(accumulator, expense.expenseDate);
  entry.expensesAmount += toNumber(expense.amountTTC);
  entry.expensesCount += 1;
}

function finalizeTimeline(accumulator) {
  return Array.from(accumulator.buckets.values())
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((entry) => ({
      ...entry,
      grossFlow: entry.salesAmount - entry.purchasesAmount - entry.expensesAmount,
    }));
}

module.exports = {
  createTimelineAccumulator,
  addSaleToTimeline,
  addPurchaseToTimeline,
  addExpenseToTimeline,
  finalizeTimeline,
};
