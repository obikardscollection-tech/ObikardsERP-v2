const prisma = require("../../lib/prisma");

async function updateCustomer(id, data) {
  const existingCustomer = await prisma.customer.findUnique({
    where: {
      id,
    },
  });

  if (!existingCustomer) {
    throw new Error("Client introuvable.");
  }

  const customer = await prisma.customer.update({
    where: {
      id,
    },
    data: {
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      company: data.company || null,

      email: data.email || null,
      phone: data.phone || null,

      address: data.address || null,
      postalCode: data.postalCode || null,
      city: data.city || null,
      country: data.country || null,

      notes: data.notes || null,
    },
  });

  return customer;
}

module.exports = {
  updateCustomer,
};