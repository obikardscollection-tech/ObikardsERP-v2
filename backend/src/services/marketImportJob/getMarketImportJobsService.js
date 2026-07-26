const prisma = require("../../lib/prisma");

function toSafeInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

function createWhereClause(filters = {}) {
  const providerCode =
    typeof filters.providerCode === "string" && filters.providerCode.trim() !== ""
      ? filters.providerCode.trim().toUpperCase()
      : null;

  if (!providerCode) {
    return {};
  }

  return {
    marketProvider: {
      code: providerCode,
    },
  };
}

function createPagination(filters = {}) {
  const take = toSafeInteger(filters.take, null);
  const skip = toSafeInteger(filters.skip, null);

  return {
    take,
    skip,
  };
}

async function getMarketImportJobs(filters = {}) {
  const where = createWhereClause(filters);
  const pagination = createPagination(filters);

  const importJobs = await prisma.marketImportJob.findMany({
    where,
    orderBy: {
      startedAt: "desc",
    },
    ...(pagination.take !== null ? { take: pagination.take } : {}),
    ...(pagination.skip !== null ? { skip: pagination.skip } : {}),
  });

  return importJobs;
}

module.exports = {
  getMarketImportJobs,
};
