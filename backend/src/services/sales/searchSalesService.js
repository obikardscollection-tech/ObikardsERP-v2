const prisma = require("../../lib/prisma");

const SALE_PLATFORMS = [
  "EBAY",
  "WHATNOT",
  "WOOCOMMERCE",
  "INSTAGRAM",
  "FACEBOOK",
  "WEBSITE",
  "SHOP",
  "CARD_SHOW",
  "DIRECT",
  "OTHER",
];

const SALE_STATUSES = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
];

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

  const status = parseEnumValue(trimmed, SALE_STATUSES);
  const platform = parseEnumValue(trimmed, SALE_PLATFORMS);

  return {
    OR: [
      { orderNumber: { contains: trimmed, mode: "insensitive" } },
      { customerName: { contains: trimmed, mode: "insensitive" } },
      {
        customer: {
          is: {
            OR: [
              { firstName: { contains: trimmed, mode: "insensitive" } },
              { lastName: { contains: trimmed, mode: "insensitive" } },
              { company: { contains: trimmed, mode: "insensitive" } },
              { email: { contains: trimmed, mode: "insensitive" } },
            ],
          },
        },
      },
      ...(status ? [{ status }] : []),
      ...(platform ? [{ platform }] : []),
    ],
  };
}

async function searchSales(query, limit) {
  return prisma.sale.findMany({
    where: buildSearchFilters(query),
    include: {
      customer: true,
      saleItems: true,
    },
    orderBy: {
      soldAt: "desc",
    },
    take: parseLimit(limit),
  });
}

module.exports = {
  searchSales,
};