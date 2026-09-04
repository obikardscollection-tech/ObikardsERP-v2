const prisma = require("../../lib/prisma");

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

function buildSearchFilters(query) {
  const trimmed = normalizeQuery(query);

  if (!trimmed) {
    return undefined;
  }

  const numberValue = Number(trimmed);

  return {
    OR: [
      { sku: { contains: trimmed, mode: "insensitive" } },
      { title: { contains: trimmed, mode: "insensitive" } },
      { player: { contains: trimmed, mode: "insensitive" } },
      { brand: { contains: trimmed, mode: "insensitive" } },
      { sport: { contains: trimmed, mode: "insensitive" } },
      { team: { contains: trimmed, mode: "insensitive" } },
      { series: { contains: trimmed, mode: "insensitive" } },
      { cardNumber: { contains: trimmed, mode: "insensitive" } },
      { status: { contains: trimmed, mode: "insensitive" } },
      ...(Number.isFinite(numberValue) ? [{ year: Number(numberValue) }] : []),
    ],
  };
}

async function searchInventory(query, limit) {
  return prisma.inventory.findMany({
    where: buildSearchFilters(query),
    select: {
      id: true,
      sku: true,
      title: true,
      player: true,
      brand: true,
      sport: true,
      team: true,
      series: true,
      cardNumber: true,
      status: true,
      year: true,
      quantity: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: parseLimit(limit),
  });
}

module.exports = {
  searchInventory,
};