const prisma = require("../../lib/prisma");
const { generateReference } = require("../common/referenceGeneratorService");

async function createCustomer(data) {
  return prisma.$transaction(async (tx) => {
    const customerNumber = await generateReference("CUS", tx);

    const customer = await tx.customer.create({
      data: {
        customerNumber,
        
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
  });
}

module.exports = {
  createCustomer,
};