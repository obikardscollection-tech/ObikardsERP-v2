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

  // Note: supplierNumber is immutable and cannot be modified
  const supplier = await prisma.supplier.update({
    where: {
      id,
    },
    data: {
      name: data.name !== undefined ? data.name : existingSupplier.name,
      company: data.company !== undefined ? data.company : existingSupplier.company,

      email: data.email !== undefined ? data.email : existingSupplier.email,
      phone: data.phone !== undefined ? data.phone : existingSupplier.phone,

      website: data.website !== undefined ? data.website : existingSupplier.website,

      address: data.address !== undefined ? data.address : existingSupplier.address,
      postalCode: data.postalCode !== undefined ? data.postalCode : existingSupplier.postalCode,
      city: data.city !== undefined ? data.city : existingSupplier.city,
      country: data.country !== undefined ? data.country : existingSupplier.country,

      notes: data.notes !== undefined ? data.notes : existingSupplier.notes,
    },
  });

  return supplier;
}

module.exports = {
  updateSupplier,
};