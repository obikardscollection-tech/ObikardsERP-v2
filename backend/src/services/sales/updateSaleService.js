const prisma = require("../../lib/prisma");

async function updateSale(id, data) {
  const existingSale = await prisma.sale.findUnique({
    where: {
      id,
    },
  });

  if (!existingSale) {
    throw new Error("Vente introuvable.");
  }

  const sale = await prisma.sale.update({
    where: {
      id,
    },
    data: {
      // orderNumber is immutable after creation
      platform: data.platform || existingSale.platform,
      status: data.status || existingSale.status,
      customerId: data.customerId ?? existingSale.customerId,
      customerName: data.customerName ?? existingSale.customerName,
      customerEmail: data.customerEmail ?? existingSale.customerEmail,
      shippingCost: Number(data.shippingCost || 0),
      platformFees: Number(data.platformFees || 0),
      taxes: Number(data.taxes || 0),
      discount: Number(data.discount || 0),
      totalAmount: Number(data.totalAmount || existingSale.totalAmount),
      profit: Number(data.profit || existingSale.profit),
      notes: data.notes ?? existingSale.notes,
      soldAt: data.soldAt ? new Date(data.soldAt) : existingSale.soldAt,
    },
  });

  return sale;
}

module.exports = {
  updateSale,
};
