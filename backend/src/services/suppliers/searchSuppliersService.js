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

  return {
    OR: [
      { supplierNumber: { contains: trimmed, mode: "insensitive" } },
      { name: { contains: trimmed, mode: "insensitive" } },
      { company: { contains: trimmed, mode: "insensitive" } },
      { email: { contains: trimmed, mode: "insensitive" } },
      { phone: { contains: trimmed, mode: "insensitive" } },
      { city: { contains: trimmed, mode: "insensitive" } },
    ],
  };
}

async function searchSuppliers(query, limit) {
  return prisma.supplier.findMany({
    where: buildSearchFilters(query),
    orderBy: {
      name: "asc",
    },
    take: parseLimit(limit),
  });
}

module.exports = {
  searchSuppliers,
};