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
      { receptionNumber: { contains: trimmed, mode: "insensitive" } },
      { notes: { contains: trimmed, mode: "insensitive" } },
      {
        purchase: {
          is: {
            OR: [
              { purchaseNumber: { contains: trimmed, mode: "insensitive" } },
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
            ],
          },
        },
      },
    ],
  };
}

async function searchReceptions(query, limit) {
  return prisma.reception.findMany({
    where: buildSearchFilters(query),
    select: {
      id: true,
      receptionNumber: true,
      receivedAt: true,
      notes: true,
      purchase: {
        select: {
          purchaseNumber: true,
          supplier: {
            select: {
              name: true,
              company: true,
            },
          },
        },
      },
    },
    orderBy: {
      receivedAt: "desc",
    },
    take: parseLimit(limit),
  });
}

module.exports = {
  searchReceptions,
};