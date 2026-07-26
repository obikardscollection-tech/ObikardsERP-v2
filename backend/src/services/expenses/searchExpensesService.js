const prisma = require("../../lib/prisma");

const EXPENSE_CATEGORIES = [
  "OFFICE",
  "SHIPPING",
  "SUPPLIES",
  "SOFTWARE",
  "MARKETING",
  "TRAVEL",
  "FUEL",
  "BANK",
  "ACCOUNTING",
  "INSURANCE",
  "RENT",
  "PHONE",
  "INTERNET",
  "EBAY_FEES",
  "WHATNOT_FEES",
  "WOOCOMMERCE_FEES",
  "PAYPAL_FEES",
  "STRIPE_FEES",
  "SALARY",
  "TRAINING",
  "OTHER",
];

const PAYMENT_METHODS = ["CARD", "BANK_TRANSFER", "PAYPAL", "STRIPE", "CASH", "CHECK", "OTHER"];

const PAYMENT_STATUSES = ["PAID", "PENDING", "REFUNDED"];

function parseLimit(limit) {
  const parsed = Number(limit);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 6;
  }

  return Math.floor(parsed);
}

function normalizeQuery(query) {
  return String(query || "").trim();
}

function parseEnumValue(query, enumValues) {
  const normalized = normalizeQuery(query).toUpperCase();

  if (!normalized) {
    return null;
  }

  return enumValues.includes(normalized) ? normalized : null;
}

function buildSearchFilters(query) {
  const trimmed = normalizeQuery(query);

  if (!trimmed) {
    return undefined;
  }

  const category = parseEnumValue(trimmed, EXPENSE_CATEGORIES);
  const paymentMethod = parseEnumValue(trimmed, PAYMENT_METHODS);
  const paymentStatus = parseEnumValue(trimmed, PAYMENT_STATUSES);

  return {
    OR: [
      { expenseNumber: { contains: trimmed, mode: "insensitive" } },
      { title: { contains: trimmed, mode: "insensitive" } },
      { description: { contains: trimmed, mode: "insensitive" } },
      { invoiceNumber: { contains: trimmed, mode: "insensitive" } },
      {
        supplier: {
          is: {
            OR: [
              { name: { contains: trimmed, mode: "insensitive" } },
              { company: { contains: trimmed, mode: "insensitive" } },
            ],
          },
        },
      },
      ...(category ? [{ category }] : []),
      ...(paymentMethod ? [{ paymentMethod }] : []),
      ...(paymentStatus ? [{ paymentStatus }] : []),
    ],
  };
}

async function searchExpenses(query, limit) {
  return prisma.expense.findMany({
    where: buildSearchFilters(query),
    include: {
      supplier: true,
    },
    orderBy: {
      expenseDate: "desc",
    },
    take: parseLimit(limit),
  });
}

module.exports = {
  searchExpenses,
};