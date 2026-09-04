const prisma = require("../../lib/prisma");

const PURCHASE_PLATFORMS = [
  "EBAY",
  "WHATNOT",
  "WOOCOMMERCE",
  "CARDMARKET",
  "WEBSITE",
  "DIRECT",
  "CARD_SHOW",
  "FACEBOOK",
  "INSTAGRAM",
  "SHOP",
  "DISTRIBUTOR",
  "OTHER",
];

const PURCHASE_STATUSES = ["PENDING", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"];

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

  const status = parseEnumValue(trimmed, PURCHASE_STATUSES);
  const platform = parseEnumValue(trimmed, PURCHASE_PLATFORMS);

  return {
    OR: [
      { purchaseNumber: { contains: trimmed, mode: "insensitive" } },
      { notes: { contains: trimmed, mode: "insensitive" } },
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
      ...(status ? [{ status }] : []),
      ...(platform ? [{ platform }] : []),
    ],
  };
}

async function searchPurchases(query, limit) {
  return prisma.purchase.findMany({
    where: buildSearchFilters(query),
    select: {
      id: true,
      purchaseNumber: true,
      status: true,
      platform: true,
      totalAmount: true,
      currency: true,
      notes: true,
      purchasedAt: true,
      supplier: {
        select: {
          name: true,
          company: true,
        },
      },
    },
    orderBy: {
      purchasedAt: "desc",
    },
    take: parseLimit(limit),
  });
}

module.exports = {
  searchPurchases,
};