const prisma = require("../../lib/prisma");

async function deleteCustomer(id) {
  const customer = await prisma.customer.findUnique({
    where: {
      id,
    },
    include: {
      sales: true,
    },
  });

  if (!customer) {
    throw new Error("Client introuvable.");
  }

  if (customer.sales.length > 0) {
    throw new Error(
      "Impossible de supprimer un client ayant des ventes associées."
    );
  }

  await prisma.customer.delete({
    where: {
      id,
    },
  });

  return {
    message: "Client supprimé avec succès.",
  };
}

module.exports = {
  deleteCustomer,
};