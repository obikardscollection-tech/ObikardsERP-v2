import InventoryActions from "./inventory/InventoryActions";
import { getInventoryCategoryLabel, getInventoryStatusLabel } from "../constants/labels";

export default function InventoryTable({
  items = [],
  onEdit,
  onDelete,
  onAdjustStock,
  sortField,
  sortDirection,
  onSort,
  selectedItems,
  onToggleSelect,
  onToggleSelectAll,
}) {
  function renderSortIcon(field) {
    if (sortField !== field) {
      return (
        <span className="ml-2 text-gray-400">
          ↕
        </span>
      );
    }

    return (
      <span className="ml-2">
        {sortDirection === "asc" ? "▲" : "▼"}
      </span>
    );
  }

  function SortableHeader({ field, children }) {
    return (
      <th
        onClick={() => onSort(field)}
        className="text-left p-4 cursor-pointer select-none hover:bg-slate-800 transition"
      >
        <div className="flex items-center">
          {children}
          {renderSortIcon(field)}
        </div>
      </th>
    );
  }

  const allSelected =
    items.length > 0 &&
    items.every((item) => selectedItems.includes(item.id));

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-900 text-white">
          <tr>
            <th className="p-4 w-12">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onToggleSelectAll(items)}
                className="w-4 h-4"
              />
            </th>

            <SortableHeader field="sku">
              SKU
            </SortableHeader>

            <SortableHeader field="category">
              Catégorie
            </SortableHeader>

            <SortableHeader field="title">
              Titre
            </SortableHeader>

            <SortableHeader field="purchasePrice">
              Achat
            </SortableHeader>

            <SortableHeader field="salePrice">
              Vente
            </SortableHeader>

            <SortableHeader field="quantity">
              Qté
            </SortableHeader>

            <SortableHeader field="status">
              Statut
            </SortableHeader>

            <th className="text-left p-4">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan="9"
                className="text-center text-gray-500 p-8"
              >
                Aucun article dans l'inventaire.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.id}
                className={`border-b hover:bg-gray-50 ${
                  selectedItems.includes(item.id)
                    ? "bg-blue-50"
                    : ""
                }`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => onToggleSelect(item.id)}
                    className="w-4 h-4"
                  />
                </td>

                <td className="p-4 font-medium">
                  {item.sku}
                </td>

                <td className="p-4">
                  {getInventoryCategoryLabel(item.category)}
                </td>

                <td className="p-4">
                  {item.title}
                </td>

                <td className="p-4">
                  {item.purchasePrice ?? "-"} €
                </td>

                <td className="p-4">
                  {item.salePrice ?? "-"} €
                </td>

                <td className="p-4">
                  {item.quantity}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      item.status === "IN_STOCK"
                        ? "bg-green-100 text-green-700"
                        : item.status === "SOLD"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {getInventoryStatusLabel(item.status)}
                  </span>
                </td>

                <td className="p-4">
                  <InventoryActions
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAdjustStock={onAdjustStock}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}