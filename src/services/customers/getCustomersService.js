const prisma = require("../../lib/prisma");

async function getCustomers() {
  const customers = await prisma.customer.findMany({
    orderBy: [
      {
        lastName: "asc",
      },
      {
        firstName: "asc",
      },
    ],
    include: {
      sales: true,
    },
  });

  return customers;
}

module.exports = {
  getCustomers,
};