function saleMapper(data) {
  return {
    orderNumber: data.orderNumber,

    platform: data.platform,

    status: data.status || "PENDING",

    customerName: data.customerName || null,
    customerEmail: data.customerEmail || null,

    shippingCost: data.shippingCost
      ? Number(data.shippingCost)
      : 0,

    platformFees: data.platformFees
      ? Number(data.platformFees)
      : 0,

    taxes: data.taxes
      ? Number(data.taxes)
      : 0,

    discount: data.discount
      ? Number(data.discount)
      : 0,

    totalAmount: null,

    profit: null,

    notes: data.notes || null,

    soldAt: data.soldAt
      ? new Date(data.soldAt)
      : new Date(),

    isCancelled: false,
  };
}

module.exports = saleMapper;