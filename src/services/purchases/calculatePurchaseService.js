function calculatePurchase(items, shippingCost = 0, taxes = 0, discount = 0) {
  const totalItems = items.reduce((total, item) => {
    return total + item.quantity * item.unitPrice;
  }, 0);

  const totalAmount =
    totalItems +
    Number(shippingCost) +
    Number(taxes) -
    Number(discount);

  return {
    totalItems,
    totalAmount,
  };
}

module.exports = {
  calculatePurchase,
};