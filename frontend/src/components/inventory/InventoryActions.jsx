export default function InventoryActions({
  item,
  onEdit,
  onDelete,
  onAdjustStock,
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onEdit(item)}
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        Modifier
      </button>

      <button
        onClick={() => onAdjustStock(item)}
        className="text-amber-600 hover:text-amber-800 hover:underline"
      >
        Stock
      </button>

      <button
        onClick={() => onDelete(item)}
        className="text-red-600 hover:text-red-800 hover:underline"
      >
        Supprimer
      </button>
    </div>
  );
}