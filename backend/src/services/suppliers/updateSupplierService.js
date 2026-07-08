const prisma = require("../../lib/prisma");

async function updateSupplier(id, data) {
  const existingSupplier = await prisma.supplier.findUnique({
    where: {
      id,
    },
  });

  if (!existingSupplier) {
    throw new Error("Fournisseur introuvable.");
  }

  const supplier = await prisma.supplier.update({
    where: {
      id,
    },
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
  updateSupplier,
};