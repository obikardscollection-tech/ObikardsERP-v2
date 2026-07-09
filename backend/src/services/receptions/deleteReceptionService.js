const prisma = require("../../lib/prisma");

const {
  deleteReceptionInventories,
} = require("./receptionInventoryCleanupService");
const {
  updatePurchaseReceptionState,
} = require("./updatePurchaseReceptionStateService");

async function deleteReception(id) {
  return prisma.$transaction(async (tx) => {
    const reception = await tx.reception.findUnique({
      where: {
        id,
      },
    });

    if (!reception) {
      throw new Error("Reception introuvable.");
    }

    await deleteReceptionInventories(tx, id);

    await tx.reception.delete({
      where: {
        id,
      },
    });

    await updatePurchaseReceptionState(
      tx,
      reception.purchaseId
    );

    return {
      message: "Reception supprimee avec succes.",
    };
  });
}

module.exports = {
  deleteReception,
};
