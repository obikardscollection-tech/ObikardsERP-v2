function toNumber(value) {
  const num = Number(value);

  return Number.isFinite(num) ? num : 0;
}

function ratio(value, base) {
  if (!base) {
    return 0;
  }

  return (toNumber(value) / toNumber(base)) * 100;
}

function growthRate(current, previous) {
  const currentValue = toNumber(current);
  const previousValue = toNumber(previous);

  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
}

function pushAggregate(map, key, amount, count, quantity = 0) {
  if (!map.has(key)) {
    map.set(key, {
      key,
      amount: 0,
      count: 0,
      quantity: 0,
    });
  }

  const current = map.get(key);
  current.amount += toNumber(amount);
  current.count += toNumber(count);
  current.quantity += toNumber(quantity);
}

function toSortedArray(map, totalAmount) {
  return Array.from(map.values())
    .map((entry) => ({
      ...entry,
      share: totalAmount > 0 ? (entry.amount / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount || b.count - a.count);
}

function getSupplierName(supplier) {
  if (!supplier) {
    return "-";
  }

  return (
    supplier.company
    || supplier.name
    || supplier.contactName
    || "-"
  );
}

function createActivityItem({
  id,
  type,
  reference,
  date,
  amount,
  platform,
  status,
  sport,
  counterparty,
  quantity,
  metadata,
}) {
  return {
    id: `${type}-${id}`,
    sourceId: id,
    type,
    reference,
    date,
    amount,
    platform: platform || null,
    status: status || null,
    sport: sport || null,
    counterparty: counterparty || null,
    quantity: toNumber(quantity),
    metadata: metadata || null,
  };
}

function sumBy(items, valueGetter) {
  return items.reduce((sum, item) => sum + toNumber(valueGetter(item)), 0);
}

module.exports = {
  toNumber,
  ratio,
  growthRate,
  pushAggregate,
  toSortedArray,
  getSupplierName,
  createActivityItem,
  sumBy,
};
