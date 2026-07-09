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

  // Note: customerNumber is immutable and cannot be modified
  const customer = await prisma.customer.update({
    where: {
      id,
    },
    data: {
      firstName: data.firstName !== undefined ? data.firstName : existingCustomer.firstName,
      lastName: data.lastName !== undefined ? data.lastName : existingCustomer.lastName,
      company: data.company !== undefined ? data.company : existingCustomer.company,

      email: data.email !== undefined ? data.email : existingCustomer.email,
      phone: data.phone !== undefined ? data.phone : existingCustomer.phone,

      address: data.address !== undefined ? data.address : existingCustomer.address,
      postalCode: data.postalCode !== undefined ? data.postalCode : existingCustomer.postalCode,
      city: data.city !== undefined ? data.city : existingCustomer.city,
      country: data.country !== undefined ? data.country : existingCustomer.country,

      notes: data.notes !== undefined ? data.notes : existingCustomer.notes,
    },
  });

  return customer;
}

module.exports = {
  updateCustomer,
};