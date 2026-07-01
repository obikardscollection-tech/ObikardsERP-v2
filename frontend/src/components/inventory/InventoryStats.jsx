export default function InventoryStats({ items }) {
  const totalItems = items.length;

  const inStock = items.filter(
    (item) => item.status === "IN_STOCK"
  ).length;

  const sold = items.filter(
    (item) => item.status === "SOLD"
  ).length;

  const stockValue = items.reduce((total, item) => {
    const salePrice = Number(item.salePrice ?? 0);
    const quantity = Number(item.quantity ?? 0);

    if (item.status === "IN_STOCK") {
      return total + salePrice * quantity;
    }

    return total;
  }, 0);

  const purchaseValue = items.reduce((total, item) => {
    const purchasePrice = Number(item.purchasePrice ?? 0);
    const quantity = Number(item.quantity ?? 0);

    return total + purchasePrice * quantity;
  }, 0);

  const potentialProfit = items.reduce((total, item) => {
    const purchasePrice = Number(item.purchasePrice ?? 0);
    const salePrice = Number(item.salePrice ?? 0);
    const quantity = Number(item.quantity ?? 0);

    if (item.status === "IN_STOCK") {
      return total + (salePrice - purchasePrice) * quantity;
    }

    return total;
  }, 0);

  const cards = [
    {
      title: "Articles",
      value: totalItems,
    },
    {
      title: "En stock",
      value: inStock,
    },
    {
      title: "Vendus",
      value: sold,
    },
    {
      title: "Valeur du stock",
      value: `${stockValue.toFixed(2)} €`,
    },
    {
      title: "Coût d'achat",
      value: `${purchaseValue.toFixed(2)} €`,
    },
    {
      title: "Profit potentiel",
      value: `${potentialProfit.toFixed(2)} €`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl shadow p-6"
        >
          <p className="text-sm text-gray-500">
            {card.title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}