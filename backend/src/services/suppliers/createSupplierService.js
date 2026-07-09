const prisma = require("../../lib/prisma");
const { generateReference } = require("../common/referenceGeneratorService");

async function createSupplier(data) {
  return prisma.$transaction(async (tx) => {
    const supplierNumber = await generateReference("SUP", tx);

    const supplier = await tx.supplier.create({
      data: {
        supplierNumber,
        
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
  });
}

module.exports = {
  createSupplier,
};