export default function InventoryActions({
  item,
  onEdit,
  onDelete,
  onRefreshMarket,
  onAdjustStock,
}) {
  const itemLabel = item?.sku || item?.title || "article";

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onEdit(item)}
        className="text-blue-600 hover:text-blue-800 hover:underline"
        aria-label={`Modifier ${itemLabel}`}
      >
        Modifier
      </button>

      <button
        type="button"
        onClick={() => onRefreshMarket?.(item)}
        className="text-violet-600 hover:text-violet-800 hover:underline"
        aria-label={`Rafraichir le Market de ${itemLabel}`}
      >
        Market
      </button>

      <button
        type="button"
        onClick={() => onAdjustStock(item)}
        className="text-amber-600 hover:text-amber-800 hover:underline"
        aria-label={`Ajuster le stock de ${itemLabel}`}
      >
        Stock
      </button>

      <button
        type="button"
        onClick={() => onDelete(item)}
        className="text-red-600 hover:text-red-800 hover:underline"
        aria-label={`Supprimer ${itemLabel}`}
      >
        Supprimer
      </button>
    </div>
  );
}