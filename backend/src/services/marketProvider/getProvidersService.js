const prisma = require("../../lib/prisma");

async function getProviders() {
  const providers = await prisma.marketProvider.findMany({
    orderBy: {
      priority: "asc",
    },
  });

  return providers;
}

module.exports = {
  getProviders,
};