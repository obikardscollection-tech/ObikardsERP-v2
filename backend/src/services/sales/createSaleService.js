const prisma = require("../../lib/prisma");

const { calculateSale } = require("./calculateSaleService");
const { createSaleItems } = require("./createSaleItemsService");
const { finalizeSale } = require("./finalizeSaleService");
const { generateReference } = require("../common/referenceGeneratorService");

async function createSale(data) {
  return prisma.$transaction(async (tx) => {
    const calculation = await calculateSale(tx, data.items);

    const orderNumber = await generateReference("SAL", tx);

    const sale = await tx.sale.create({
      data: {
        orderNumber,
        platform: data.platform,

        customerName: data.customerName || null,
        customerEmail: data.customerEmail || null,

        shippingCost: Number(data.shippingCost || 0),
        platformFees: Number(data.platformFees || 0),
        taxes: Number(data.taxes || 0),
        discount: Number(data.discount || 0),

        totalAmount: calculation.totalAmount,
        profit: calculation.profit,

        notes: data.notes || null,
      },
    });

    await createSaleItems(tx, sale.id, data.items);

    await finalizeSale(tx, data.items);

    return sale;
  });
}

module.exports = {
  createSale,
};