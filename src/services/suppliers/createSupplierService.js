const prisma = require("../../lib/prisma");

async function createSupplier(data) {
  const supplier = await prisma.supplier.create({
    data: {
      name: data.name,
      company: data.company || null,

      email: data.email || null,
      phone: data.phone || null,

      website: data.website || null,

      address: data.address || null,
      postalCode: data.postalCode || null,
      city: data.city || null,
      country: data.country || null,

      notes: data.notes || null,
    },
  });

  return supplier;
}

module.exports = {
  createSupplier,
};