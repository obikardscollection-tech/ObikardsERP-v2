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
    marketImportJob: {
      marketProvider: {
        code: providerCode,
      },
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

async function getMarketImportErrors(filters = {}) {
  const where = createWhereClause(filters);
  const pagination = createPagination(filters);

  const importErrors = await prisma.marketImportError.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    ...(pagination.take !== null ? { take: pagination.take } : {}),
    ...(pagination.skip !== null ? { skip: pagination.skip } : {}),
  });

  return importErrors;
}

module.exports = {
  getMarketImportErrors,
};
