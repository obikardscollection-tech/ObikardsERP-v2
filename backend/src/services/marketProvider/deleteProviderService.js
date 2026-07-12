const prisma = require("../../lib/prisma");

async function deleteProvider(id) {
  const provider = await prisma.marketProvider.findUnique({
    where: {
      id,
    },
  });

  if (!provider) {
    throw new Error("Provider introuvable.");
  }

  await prisma.marketProvider.delete({
    where: {
      id,
    },
  });

  return {
    message: "Provider supprimé avec succès.",
  };
}

module.exports = {
  deleteProvider,
};