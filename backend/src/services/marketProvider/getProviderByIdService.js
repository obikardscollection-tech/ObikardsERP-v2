const prisma = require("../../lib/prisma");

async function getProviderById(id) {
  const provider = await prisma.marketProvider.findUnique({
    where: {
      id,
    },
  });

  if (!provider) {
    throw new Error("Provider introuvable.");
  }

  return provider;
}

module.exports = {
  getProviderById,
};