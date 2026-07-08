const prisma = require("../../lib/prisma");

async function getCustomerById(id) {
  const customer = await prisma.customer.findUnique({
    where: {
      id,
    },
    include: {
      sales: {
        orderBy: {
          soldAt: "desc",
        },
      },
    },
  });

  if (!customer) {
    throw new Error("Client introuvable.");
  }

  return customer;
}

module.exports = {
  getCustomerById,
};