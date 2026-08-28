const prisma = require("../../lib/prisma");

const { calculateSale } = require("./calculateSaleService");
const { createSaleItems } = require("./createSaleItemsService");
const { finalizeSale } = require("./finalizeSaleService");
const { generateReference } = require("../common/referenceGeneratorService");

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function createSale(data) {
  return prisma.$transaction(async (tx) => {
    const items = Array.isArray(data.items) ? data.items : [];

    if (!items.length) {
      throw new Error("Au moins un article est obligatoire pour créer une vente.");
    }

    const calculation = await calculateSale(tx, items);

    const orderNumber = await generateReference("SAL", tx);

    const saleData = {
      orderNumber,
      platform: data.platform,
      status: data.status || "PENDING",

      customerId: data.customerId || null,
      customerName: data.customerName || null,
      customerEmail: data.customerEmail || null,

      shippingCost: toNumber(data.shippingCost, 0),
      platformFees: toNumber(data.platformFees, 0),
      taxes: toNumber(data.taxes, 0),
      discount: toNumber(data.discount, 0),

      totalItems: Number(calculation.totalItems || 0),
      totalAmount: toNumber(calculation.totalAmount, 0),
      profit: toNumber(calculation.profit, 0),

      currency: data.currency || "EUR",
      soldAt: data.soldAt ? new Date(data.soldAt) : new Date(),
      notes: data.notes || null,
    };

    const sale = await tx.sale.create({
      data: saleData,
    });

    await createSaleItems(tx, sale.id, items);
    await finalizeSale(tx, sale.id, items);

    return sale;
  });
}

module.exports = {
  createSale,
};