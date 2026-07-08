function calculatePurchase(items, shippingCost = 0, taxes = 0, discount = 0) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Au moins une ligne d'achat est obligatoire.");
  }

  const purchaseItems = items.map((item) => {
    const quantity = Number(item.quantity || 1);
    const unitPrice = Number(item.unitPrice || 0);

    if (!item.name) {
      throw new Error("Le nom de chaque ligne d'achat est obligatoire.");
    }

    if (quantity <= 0) {
      throw new Error(
        `La quantite doit etre superieure a 0 pour "${item.name}".`
      );
    }

    if (unitPrice < 0) {
      throw new Error(
        `Le prix unitaire ne peut pas etre negatif pour "${item.name}".`
      );
    }

    return {
      ...item,
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
    };
  });

  const totalItems = purchaseItems.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  const itemsAmount = purchaseItems.reduce((total, item) => {
    return total + item.totalPrice;
  }, 0);

  const totalAmount =
    itemsAmount +
    Number(shippingCost) +
    Number(taxes) -
    Number(discount);

  return {
    purchaseItems,
    totalItems,
    totalAmount,
  };
}

module.exports = {
  calculatePurchase,
};
