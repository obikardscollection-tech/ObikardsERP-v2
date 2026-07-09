const prisma = require("../../lib/prisma");

async function getReceptionById(id) {
  const reception = await prisma.reception.findUnique({
    where: {
      id,
    },
    include: {
      purchase: {
        include: {
          supplier: true,
        },
      },
      receptionItems: {
        include: {
          purchaseItem: true,
          inventory: true,
        },
      },
    },
  });

  if (!reception) {
    throw new Error("Reception introuvable.");
  }

  return reception;
}

module.exports = {
  getReceptionById,
};
